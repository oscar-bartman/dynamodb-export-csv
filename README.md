[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# export-table

## Usage

### Configuration

Set the following variables through env: 

| name                  | description                                         | example                                                       | required |
|-----------------------|-----------------------------------------------------|---------------------------------------------------------------|----------|
| AWS_REGION            | your aws region                                     | eu-west-1                                                     | yes      |
| EXPORT_BUCKET         | a bucket you have configured to store the export to | verzekerden-export-bucket                                     | yes      |
| AWS_ACCESS_KEY_ID     |  your (admin) aws access key id                     | AKIA.....                                                     | yes      |
| AWS_SECRET_ACCESS_KEY | you (admin) aws access key                          | very_very_secret                                              | yes      |

Run in your terminal: 

Obtain an ExportArn through the [ExportTableToPointInTime](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ExportTableToPointInTime.html) action provided by AWS. For CLI check [here](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/export-table-to-point-in-time.html).

```
aws dynamodb export-table-to-point-in-time --table-arn  
```

Then download the export as a CSV:

```bash
$ node src/index.js arn:aws:dynamodb:...
```

## Development

### Debug this code

```bash
$ node --inspect src/index.js # normal inspect
$ node --inspect-brk src/index.js # break on first line
```

On vscode: 

Create normal "attach" debug configuration and attach to the running process.

Or just drop this in the command window (ctrl + shift + p): 
```
extension.pwa-node-debug.attachNodeProcess
```
and select the running node process.