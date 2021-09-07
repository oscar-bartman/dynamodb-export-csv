const assert = require('assert')
const { columnsInputRegex } = require('../../src/util/validations')

describe('columnsInputRegex', () => {
  it('basic example', () => {
    const keyValuePairs = 'key=foo.bar&header=foobar,key=id'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), true)
  })

  it('missing \'=\'', () => {
    const keyValuePairs = 'keyfoo.bar&header=foobar,key=id'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), false)
  })

  it('single field only key', () => {
    const keyValuePairs = 'key=foo'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), true)
  })

  it('trailing comma', () => {
    const keyValuePairs = 'key=foo,'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), false)
  })

  it('space in header values', () => {
    const keyValuePairs = 'key=foo.bar&header=foo bar,key=id'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), true)
  })

  it('another basic example', () => {
    const keyValuePairs = 'key=wgnummer&header=Werkgeversnummer,key=email&header=emailadres,key=handelsnaam&header=handelsnaam werkgever,key=kanaalvoorkeur&header=kanaalkeuze,key=naam&header=statutaire naam werkgever,key=relatienummer,key=telefoonnummer'
    assert.strictEqual(columnsInputRegex.test(keyValuePairs), true)
  })
})
