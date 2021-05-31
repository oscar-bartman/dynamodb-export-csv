const assert = require('assert')
const parseKeyHeaderPairs = require('../src/parseKeyHeaderPairs')

describe('', () => {
  it('parses key header strings', () => {
    const keyValuePairs = 'key=adresStatutair.postcode&header=postcode,key=wgnummer'
    assert.deepStrictEqual(parseKeyHeaderPairs(keyValuePairs), [
      {
        key: 'adresStatutair.postcode',
        header: 'postcode'
      },
      { key: 'wgnummer' }
    ])
  })
})
