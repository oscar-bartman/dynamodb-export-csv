const {
  DynamoDBClient,
  ExportTableToPointInTimeCommand,
  ExportFormat,
  DescribeExportCommand,
  ExportStatus
} = require('@aws-sdk/client-dynamodb')
const {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand
} = require('@aws-sdk/client-s3')
const config = require('./config')
const { dataKeyRegex } = require('./utils')
const { createGunzip } = require('zlib')
const { pipeline, Writable } = require('stream')
const fs = require('fs')
// const { promisify } = require('utixl')

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

async function waitCompleted () {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const exportDescription = await getExportDescription()
      switch (exportDescription.ExportStatus) {
        case ExportStatus.IN_PROGRESS:
          console.log('In progress...')
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

async function retrieveObjects () {
  const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
  })

  const listObjectsCommandOutput = await s3Client.send(new ListObjectsCommand({
    Bucket: config.EXPORT_BUCKET
  }))

  const keys = listObjectsCommandOutput.Contents
    .map(e => e.Key)
    .filter(key => dataKeyRegex.test(key))

  return Promise.all(keys.map(key => {
    return s3Client.send(new GetObjectCommand({
      Bucket: config.EXPORT_BUCKET,
      Key: key
    }))
  }))
}

setImmediate(async () => {
  // const exportArn = await orderExport()
  // await waitCompleted(exportArn)
  const exportObjects = await retrieveObjects()
  const chunks = []

  function collateChunks () {
    const writable = new Writable()
    writable._write = (chunk, _encoding, next) => {
      chunks.push(chunk.toString())
      next()
    }
    return writable
  }

  exportObjects.forEach(getObjectCommanOutput => {
    pipeline(
      getObjectCommanOutput.Body,
      createGunzip(),
      collateChunks(),
      function (err) {
        console.error(err)
        process.exit(1)
      })
  })
})
