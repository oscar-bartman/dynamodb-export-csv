const assert = require('assert')
const { filterPathRegex } = require('../src/validations')

describe('filterPathRegex', () => {
  it('basic example', () => {
    const value = 'foo'
    assert.strictEqual(filterPathRegex.test(value), true)
  })

  it('nested one level', () => {
    const value = 'foo.bar'
    assert.strictEqual(filterPathRegex.test(value), true)
  })

  it('deep nested', () => {
    const value = 'foo.bar.baz.qux'
    assert.strictEqual(filterPathRegex.test(value), true)
  })

  it('trailing dot', () => {
    const value = 'foo.bar.baz.'
    assert.strictEqual(filterPathRegex.test(value), false)
  })

  it('leading dot', () => {
    const value = '.foo.bar.baz.qux'
    assert.strictEqual(filterPathRegex.test(value), false)
  })
})
