const { Duplex } = require('stream')
const objectPath = require('object-path')

function filter (path, predicate) {
  return new Duplex({
    objectMode: true,
    write (chunk, _encoding, callback) {
      if (objectPath.has(chunk, path)) {
        if (predicate(objectPath.get(chunk, path))) {
          this.push(chunk)
        }
      }
      callback()
    },
    read (size) {
      return this.read(size)
    }
  })
}

module.exports = filter
