const {
  DynamoDBClient,
  ExportTableToPointInTimeCommand,
  ExportFormat,
  DescribeExportCommand,
  ExportStatus
} = require('@aws-sdk/client-dynamodb')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { unmarshall } = require('@aws-sdk/util-dynamodb')
const { createGunzip } = require('zlib')
const { Transform, Duplex } = require('stream')
const fs = require('fs')
const stringify = require('csv-stringify')
const config = require('./config')

setImmediate(async () => {
  const client = new DynamoDBClient({
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
  })

  async function orderExport () {
    const exportTableToPointInTimeCommandOutput = await client.send(
      new ExportTableToPointInTimeCommand({
        ExportFormat: ExportFormat.DYNAMODB_JSON,
        S3Bucket: config.EXPORT_BUCKET,
        TableArn: config.TABLE_ARN
      })
    )
    return exportTableToPointInTimeCommandOutput.ExportDescription.ExportArn
  }

  async function getExportDescription (exportArn) {
    const describeExportCommandOutput = await client.send(
      new DescribeExportCommand({
        ExportArn: exportArn
      })
    )
    return describeExportCommandOutput.ExportDescription
  }

  async function waitCompleted (exportArn) {
    return new Promise((resolve, reject) => {
      process.stdout.write('In progress...')
      const interval = setInterval(async () => {
        const exportDescription = await getExportDescription(exportArn)
        switch (exportDescription.ExportStatus) {
          case ExportStatus.IN_PROGRESS:
            process.stdout.write('.')
            break
          case ExportStatus.FAILED:
            clearInterval(interval)
            reject(new Error('Failed'))
            break
          case ExportStatus.COMPLETED:
            clearInterval(interval)
            resolve()
            break
          default:
            break
        }
      }, 4000)
    })
  }

  async function retrieveObjects (exportArn) {
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

  function spreadBuffer () {
    return new Duplex({
      objectMode: true,
      write (chunk, _encoding, callback) {
        const dynamoDBRecords = chunk.toString().split('\n').filter(e => e)
        if (this.remainder) {
          dynamoDBRecords[0] = `${this.remainder}${dynamoDBRecords[0]}`
          this.remainder = null
        }

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

  function writeToCSV (records) {
    records.forEach((record, index) => {
      record.Body
        .pipe(createGunzip())
        .pipe(spreadBuffer())
        .pipe(dynamodbRecordUnmarshall())
        .pipe(stringify({
          header: true,
          columns: ['wgnummer', 'email']
        }))
        .pipe(fs.createWriteStream(`${index}.csv`))
    })
  }

  const exportArn = await orderExport()
  fs.appendFileSync('log.txt', `${exportArn}\n`)
  await waitCompleted(exportArn)
  const exportObjects = await retrieveObjects(exportArn)
  writeToCSV(exportObjects)
})
