[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# dynamodb-export-csv

## Usage

### Configuration

Set the following variables through env:

| name                  | description                                         | example                                                       | required |
|-----------------------|-----------------------------------------------------|---------------------------------------------------------------|----------|
| AWS_ACCESS_KEY_ID     |  your aws access key id                     | AKIA...                                                     | yes      |
| AWS_SECRET_ACCESS_KEY | you aws access key                          | very_very_secret                                              | yes      |
| AWS_REGION            | your aws region                                     | eu-west-1                                                     | yes      |
| EXPORT_ARN            | arn of the export you want to download as csv  | arn:...                                                     | yes      |


Download the export as csv. Specify which fields in the data you want under which header name.

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
