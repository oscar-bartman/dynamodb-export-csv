const { Readable, Writable } = require('stream')
const { deepStrictEqual } = require('assert')
const { records } = require('../../src/streams')

describe('records', () => {
  it('turns chunks into discrete record strings', () => {
    const chunk1 = Buffer.from(
      `{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}
{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}
{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}
{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"`
    )
    const chunk2 = Buffer.from(
      `email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}
{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}
{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}
{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}`
    )
    Readable.from((function * generator () {
      yield chunk1
      yield chunk2
    })())
      .pipe(records())
      .pipe(new Writable({
        objectMode: true,
        write (chunk, _encoding, callback) {
          this.pass = this.pass ? this.pass + 1 : 1
          deepStrictEqual(
            chunk,
            '{"Item":{"someObject":{"M":{"numberValue":{"N":"7"},"stringValue":{"S":"stringValue"},"stringValue1":{"S":"stringValue1"},"stringValue2":{"S":"stringValue2"}}},"email":{"S":"me@example.com"},"aNullValue":{"NULL":true}}}',
            new Error(`not getting expected result at pass ${this.pass}`)
          )
          callback()
        }
      }))
  })
})
