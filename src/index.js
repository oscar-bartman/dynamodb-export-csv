#!/usr/bin/env node
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { unmarshall } = require('@aws-sdk/util-dynamodb')
const { createGunzip } = require('zlib')
const { Transform, Duplex } = require('stream')
const fs = require('fs')
const stringify = require('csv-stringify')
const assert = require('assert')
const { exit } = require('process')
const objectPath = require('object-path')
const config = require('./config')
const parseKeyHeaderPairs = require('./parseKeyHeaderPairs')
const { columnsInputRegex, filterPathRegex } = require('./validations')

setImmediate(async () => {
  async function getRecords (exportArn) {
    const s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
      }
    })

    const manifestJsonResponse = await s3Client.send(new GetObjectCommand({
      Bucket: config.EXPORT_BUCKET,
      Key: `AWSDynamoDB/${exportArn.split('/').pop()}/manifest-files.json`
    }))

    const keys = await new Promise((resolve) => {
      const chunks = []
      manifestJsonResponse.Body.on('data', (data) => {
        chunks.push(data.toString())
      })
      manifestJsonResponse.Body.on('end', () => {
        resolve(
          chunks
            .join('')
            .split('\n')
            .filter(e => e)
            .map(e => JSON.parse(e).dataFileS3Key)
        )
      })
    })

    return Promise.all(keys.map(key => {
      return s3Client.send(new GetObjectCommand({
        Bucket: config.EXPORT_BUCKET,
        Key: key
      }))
    }))
  }

  /**
   * Stream based csv writer for a dynamodb export
   *
   * @param s3Objects - export response from s3
   * @param options - options
   * @param options.columns - keys and headers to display, passed to [csv-stringify](https://csv.js.org/stringify/options/columns/)
   * @param options.filterPath - which field to filter on defined as an object path
   * @param options.filterPredicate - predicate function that takes a dynamodb record as an object
   */
  function writeToCSV (s3Objects, { columns, filterPath, filterPredicate }) {
    /**
     * Turns string chunks into discrete record strings and passes them on as
     * single chunks.
     */
    function records () {
      return new Duplex({
        objectMode: true,
        write (chunk, _encoding, callback) {
          const lines = chunk.toString().split('\n').filter(e => e)
          if (this.remainder) {
            lines[0] = `${this.remainder}${lines[0]}`
            this.remainder = null
          }

          // last line of a chunk (in)complete
          const last = lines[lines.length - 1]
          try {
            JSON.parse(last)
          } catch (err) {
            this.remainder = lines.pop()
          }

          lines.forEach(record => {
            this.push(record)
          })

          callback()
        },
        read (size) {
          return this.read(size)
        }
      })
    }

    function filter (path, predicate) {
      return new Duplex({
        objectMode: true,
        write (chunk, _encoding, callback) {
          if (objectPath.has(chunk, path)) {
            if (predicate(objectPath.get(chunk, path))) {
              this.push(chunk)
            }
          }
          callback()
        },
        read (size) {
          return this.read(size)
        }
      })
    }

    function dynaUnmarshall () {
      return new Transform({
        objectMode: true,
        transform (chunk, _encoding, callback) {
          callback(null, unmarshall(JSON.parse(chunk).Item))
        }
      })
    }

    s3Objects.forEach((record, index) => {
      const unmarshalledStream = record.Body
        .pipe(createGunzip())
        .pipe(records())
        .pipe(dynaUnmarshall())

      const stream = (filterPath ? unmarshalledStream.pipe(filter(filterPath, filterPredicate)) : unmarshalledStream)

      stream
        .pipe(stringify({
          header: true,
          columns
        }))
        .pipe(fs.createWriteStream(`${index}.csv`))
    })
  }

  try {
    const [,, exportArn, keyValuePairs, filterPath, filterValue] = process.argv
    assert(exportArn, new Error('requires exportArn'))
    assert(keyValuePairs, new Error('requires columns input'))
    assert.match(keyValuePairs, columnsInputRegex, new Error('wrong column input'))
    if (filterPath) {
      assert.match(filterPath, filterPathRegex, new Error('filter path invalid'))
    }

    const columns = parseKeyHeaderPairs(keyValuePairs)

    writeToCSV(await getRecords(exportArn), {
      columns,
      ...(filterPath
        ? {
            filterPath,
            filterPredicate: (prop) => {
              return prop === filterValue
            }
          }
        : {})
    })

    fs.appendFileSync('arns.log', `${exportArn}\n`)
  } catch (err) {
    console.log(err)
    exit(1)
  }
})
