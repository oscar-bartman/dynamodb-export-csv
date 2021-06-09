const assert = require('assert')
const parseKeyHeaderPairs = require('../../src/util/parseKeyHeaderPairs')

describe('parseKeyHeaderPairs', () => {
  it('parses key header strings', () => {
    const keyValuePairs = 'key=foo.bar&header=foobar,key=id'
    assert.deepStrictEqual(parseKeyHeaderPairs(keyValuePairs), [
      {
        key: 'foo.bar',
        header: 'foobar'
      },
      { key: 'id' }
    ])
  })

  it('allows a space in the header value', () => {
    const keyValuePairs = 'key=foo.bar&header=foo bar,key=id'
    assert.deepStrictEqual(parseKeyHeaderPairs(keyValuePairs), [
      {
        key: 'foo.bar',
        header: 'foo bar'
      },
      { key: 'id' }
    ])
  })
})
