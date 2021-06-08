const assert = require('assert')
const parseKeyHeaderPairs = require('../../src/util/parseKeyHeaderPairs')

describe('parseKeyHeaderPairs', () => {
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
