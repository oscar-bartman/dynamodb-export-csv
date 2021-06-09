#!/usr/bin/env node
const fs = require('fs')
const { createGunzip } = require('zlib')
const assert = require('assert')
const { exit } = require('process')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const stringify = require('csv-stringify')
const config = require('./config')
const parseKeyHeaderPairs = require('./util/parseKeyHeaderPairs')
const { columnsInputRegex, filterPathRegex } = require('./util/validations')
const { records, filter, dynaUnmarshall } = require('./streams')

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

  function writeToCSV (s3Objects, { columns, filterPath, filterPredicate }) {
    s3Objects.forEach((record, index) => {
      const unmarshallStream = record.Body
        .pipe(createGunzip())
        .pipe(records())
        .pipe(dynaUnmarshall())

      const stream = (filterPath ? unmarshallStream.pipe(filter(filterPath, filterPredicate)) : unmarshallStream)

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
    console.log(err.message)
    exit(1)
  }
})
