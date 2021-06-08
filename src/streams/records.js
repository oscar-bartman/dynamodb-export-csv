const { Duplex } = require('stream')

/**
 * the chunkiest buffer
 *
* Turns string chunks into discrete record strings and passes them on as
* single chunks.
*/
function records () {
  return new Duplex({
    objectMode: true,
    write (chunk, _encoding, callback) {
      const lines = chunk.toString().split('\n').filter(e => e)
      if (this.remainder) {
        lines[0] = `${this.remainder}${lines[0]}`
        this.remainder = null
      }

      // last line of a chunk (in)complete
      const last = lines[lines.length - 1]
      try {
        JSON.parse(last)
      } catch (err) {
        this.remainder = lines.pop()
      }

      lines.forEach(record => {
        this.push(record)
      })

      callback()
    },
    read (size) {
      return this.read(size)
    }
  })
}

module.exports = records
