const { filter } = require('../../src/streams')
const { Readable, Writable } = require('stream')
const { deepStrictEqual } = require('assert')

describe('filter', () => {
  it('filters chunks based on path and value', () => {
    const red = { baz: 'qux', color: 'RED' }
    const blue = { foo: 'bar', color: 'BLUE' }
    Readable.from((function * generator () {
      yield blue
      yield red
      yield blue
      yield red
      yield blue
      yield red
    })())
      .pipe(filter('color', (val) => val === 'RED'))
      .pipe(new Writable({
        objectMode: true,
        write (chunk, _encoding, callback) {
          deepStrictEqual(chunk, red)
          callback()
        }
      }))
  })

  it('supports nested paths', () => {
    const red = { baz: 'qux', favorites: { color: 'RED' } }
    const blue = { foo: 'bar', favorites: { color: 'BLUE' } }
    Readable.from((function * generator () {
      yield blue
      yield red
      yield blue
      yield red
      yield blue
      yield red
    })())
      .pipe(filter('favorites.color', (val) => val === 'RED'))
      .pipe(new Writable({
        objectMode: true,
        write (chunk, _encoding, callback) {
          deepStrictEqual(chunk, red)
          callback()
        }
      }))
  })

  it('ignores inextant property paths', () => {
    const blue = { foo: 'bar', color: 'BLUE' }
    Readable.from((function * generator () {
      yield blue
      yield blue
      yield blue
    })())
      .pipe(filter('size', (val) => val === 'XXL'))
      .pipe(new Writable({
        objectMode: true,
        write (chunk, _encoding, callback) {
          deepStrictEqual(chunk, blue)
          callback()
        }
      }))
  })
})
