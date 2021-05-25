const { dataKeyRegex } = require('../src/utils')
const assert = require('assert')

describe('utils', () => {
  describe('dataKeyRegex', () => {
    const strings = [
      'AWSDynamoDB/01621587695378-f705d932/_started',
      'AWSDynamoDB/01621587695378-f705d932/data/2wqa2g4rai7lxd5wxhbd2x5hcm.json.gz',
      'AWSDynamoDB/01621587695378-f705d932/data/o32dxxxsmuzkhacumta3p4qtpy.json.gz',
      'AWSDynamoDB/01621587695378-f705d932/data/x24s4lbil47rdhma34ilkmrmba.json.gz',
      'AWSDynamoDB/01621587695378-f705d932/data/z3ap7nv6ui4ipisuaojjocmcv4.json.gz',
      'AWSDynamoDB/01621587695378-f705d932/manifest-files.json',
      'AWSDynamoDB/01621587695378-f705d932/manifest-files.md5',
      'AWSDynamoDB/01621587695378-f705d932/manifest-summary.json',
      'AWSDynamoDB/01621587695378-f705d932/manifest-summary.md5'
    ]

    it(strings[0], () => {
      assert.strictEqual(dataKeyRegex.test(strings[0]), false)
    })

    it(strings[1], () => {
      assert.strictEqual(dataKeyRegex.test(strings[1]), true)
    })

    it(strings[2], () => {
      assert.strictEqual(dataKeyRegex.test(strings[2]), true)
    })

    it(strings[3], () => {
      assert.strictEqual(dataKeyRegex.test(strings[3]), true)
    })

    it(strings[4], () => {
      assert.strictEqual(dataKeyRegex.test(strings[4]), true)
    })

    it(strings[5], () => {
      assert.strictEqual(dataKeyRegex.test(strings[5]), false)
    })

    it(strings[6], () => {
      assert.strictEqual(dataKeyRegex.test(strings[6]), false)
    })

    it(strings[7], () => {
      assert.strictEqual(dataKeyRegex.test(strings[7]), false)
    })

    it(strings[8], () => {
      assert.strictEqual(dataKeyRegex.test(strings[8]), false)
    })
  })
})
