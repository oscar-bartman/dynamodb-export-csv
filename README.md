[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# dynamodb-export-csv

## Usage

### Configuration

Set the following variables through env:

| name                  | description                                         | example                                                       | required |
|-----------------------|-----------------------------------------------------|---------------------------------------------------------------|----------|
| AWS_REGION            | your aws region                                     | eu-west-1                                                     | yes      |
| EXPORT_BUCKET         | a bucket you have configured to store the export to | my-export-bucket                                     | yes      |
| AWS_ACCESS_KEY_ID     |  your aws access key id                     | AKIA.....                                                     | yes      |
| AWS_SECRET_ACCESS_KEY | you aws access key                          | very_very_secret                                              | yes      |

Run in your terminal: 

Obtain an ExportArn through the [ExportTableToPointInTime](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ExportTableToPointInTime.html) action provided by AWS. For CLI check [here](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/export-table-to-point-in-time.html). You can also use the AWS console.

CLI example: 

```bash
$ aws dynamodb export-table-to-point-in-time --table-arn=$TABLE_ARN --s3-bucket=export-bucket | jq '.ExportDescription.ExportArn'
```

Check on the status:

```bash
$ aws dynamodb describe-export --export-arn=$EXPORT_ARN | jq '.ExportDescription.ExportStatus'
```

Then download the export as a CSV using the export arn. Specify which fields in the data you want under which header name.

```bash
$ dynamodb-export-csv $EXPORT_ARN 'key=id,key=contact.email&header=email'
```

## Development

### Run tests

```
npm t

```

### Debug this code

```bash
$ node --inspect-brk src/index.js
```
