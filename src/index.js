const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { unmarshall } = require('@aws-sdk/util-dynamodb')
const { createGunzip } = require('zlib')
const { Transform, Duplex } = require('stream')
const fs = require('fs')
const stringify = require('csv-stringify')
const assert = require('assert')
const { exit } = require('process')
const config = require('./config')
const parseKeyHeaderPairs = require('./parseKeyHeaderPairs')
const { columnsInputRegex } = require('./validations')

setImmediate(async () => {
  async function retrieveRecords (exportArn) {
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

  function writeToCSV (records, { columns }) {
    /**
     * Turns string chunks into discrete record strings and passes them on as
     * single chunks.
     */
    function spreadBuffer () {
      return new Duplex({
        objectMode: true,
        write (chunk, _encoding, callback) {
          const dynamoDBRecords = chunk.toString().split('\n').filter(e => e)
          if (this.remainder) {
            dynamoDBRecords[0] = `${this.remainder}${dynamoDBRecords[0]}`
            this.remainder = null
          }

          // last line in a chunk of records may be an incomplete record
          const last = dynamoDBRecords[dynamoDBRecords.length - 1]
          try {
            JSON.parse(last)
          } catch (err) {
            this.remainder = dynamoDBRecords.pop()
          }

          dynamoDBRecords.forEach(record => {
            this.push(record)
          })

          callback()
        },
        read (size) {
          return this.read(size)
        }
      })
    }

    function dynamodbRecordUnmarshall () {
      return new Transform({
        objectMode: true,
        transform (chunk, _encoding, callback) {
          callback(null, unmarshall(JSON.parse(chunk).Item))
        }
      })
    }

    records.forEach((record, index) => {
      record.Body
        .pipe(createGunzip())
        .pipe(spreadBuffer())
        .pipe(dynamodbRecordUnmarshall())
        .pipe(stringify({
          header: true,
          columns
        }))
        .pipe(fs.createWriteStream(`${index}.csv`))
    })
  }

  try {
    const [,, exportArn, keyValuePairs] = process.argv
    assert(exportArn, new Error('requires exportArn'))
    assert(keyValuePairs, new Error('reqruires columns input'))
    assert.match(keyValuePairs, columnsInputRegex, new Error('columns input faulty'))
    const columns = parseKeyHeaderPairs(keyValuePairs)
    const dynamodbRecords = await retrieveRecords(exportArn)
    writeToCSV(dynamodbRecords, { columns })
    fs.appendFileSync('arns.log', `${exportArn}\n`)
  } catch (err) {
    console.log(err)
    exit(1)
  }
})
