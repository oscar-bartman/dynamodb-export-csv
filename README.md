# export-table

## Usage

### Configuration

Set the following variables through env: 

| name                  | description                                         | example                                                       | required |
|-----------------------|-----------------------------------------------------|---------------------------------------------------------------|----------|
| AWS_REGIONS           | your aws region                                     | eu-west-1                                                     | yes      |
| EXPORT_BUCKET         | a bucket you have configured to store the export to | verzekerden-export-bucket                                     | yes      |
| AWS_ACCESS_KEY_ID     |  your (admin) aws access key id                     | AKIA.....                                                     | yes      |
| AWS_SECRET_ACCESS_KEY | you (admin) aws access key                          | very_very_secret                                              | yes      |
| TABLE_ARN             | the aws arn of the table you would like to export   | arn:aws:dynamodb:eu-west-1:107981364501:table/dev-Verzekerden | yes      |

Run in your terminal: 

```bash
$ npx @oscar-bartman/export-dynamo-table [table-name]
```

## Development