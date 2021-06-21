[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# dynamodb-export-csv

Tool that downloads a dynamodb table export stored in s3 as csv files. 

## Usage

Set the following variables through env:

| name                  | description                                        | example        | required |
|-----------------------|----------------------------------------------------|----------------|----------|
| AWS_ACCESS_KEY_ID     |  your aws access key id                            | ...            | yes      |
| AWS_SECRET_ACCESS_KEY | you aws access key                                 | ...            | yes      |
| AWS_REGION            | your aws region                                    | ...            | yes      |
| EXPORT_BUCKET         | name of the bucket that you stored your export in. | arn:...        | yes      |


Download the export as csv. Specify which fields in the data you want under which header name.

```bash
$ export EXPORT_ARN = arn:aws:dynamodb:...
$ dynamodb-export-csv $EXPORT_ARN 'key=id,key=contact.email&header=email'
```

### Outputs: 
0.csv, 1.csv, ..., x.csv, arns.log

### Using filters

You can pass filters by specifying which field you want to filter on and which value it should have. Currently only equals filters are supported:

```bash
$ dynamodb-export-csv $EXPORT_ARN 'key=id,key=contact.email&header=email' 'preferences.favoriteColor' 'BLUE'
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
