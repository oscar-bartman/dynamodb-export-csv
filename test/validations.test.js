const assert = require('assert')
const { columnsInputRegex } = require('../src/validations')

describe('columnsInputRegex', () => {
  it('basic example', () => {
    const keyValuePairs = 'key=adresStatutair.postcode&header=postcode,key=wgnummer'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), true)
  })

  it('missing \'=\'', () => {
    const keyValuePairs = 'keyadresStatutair.postcode&header=postcode,key=wgnummer'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), false)
  })

  it('single field only key', () => {
    const keyValuePairs = 'key=wgnummer'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), true)
  })

  it('trailing comma', () => {
    const keyValuePairs = 'key=wgnummer,'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), false)
  })
})
