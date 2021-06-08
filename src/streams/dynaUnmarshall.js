const { unmarshall } = require('@aws-sdk/util-dynamodb')
const { Transform } = require('stream')

function dynaUnmarshall () {
  return new Transform({
    objectMode: true,
    transform (chunk, _encoding, callback) {
      callback(null, unmarshall(JSON.parse(chunk).Item))
    }
  })
}

module.exports = dynaUnmarshall
