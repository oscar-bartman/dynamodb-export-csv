const dynaUnmarshall = require('../../src/streams/dynaUnmarshall')
const { Readable, Writable } = require('stream')
const { deepStrictEqual } = require('assert')

describe('dynaUnmarshall', () => {
  it('unmarshalls dynamodb records in a stream', () => {
    Readable.from((function * generator () {
      yield '{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}'
    })())
      .pipe(dynaUnmarshall())
      .pipe(new Writable({
        objectMode: true,
        write (chunk, _encoding, callback) {
          deepStrictEqual(chunk, {
            someObject: {
              numberValue: 7,
              stringValue: 'stringValue',
              stringValue1: 'stringValue1',
              stringValue2: 'stringValue2'
            },
            email: 'me@example.com',
            aNullValue: null
          }, new Error('not getting expected result'))
        }
      }))
  })
})
