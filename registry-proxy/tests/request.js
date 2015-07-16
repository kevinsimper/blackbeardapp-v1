var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()

lab.test('returns true when 1 + 1 equals 2', function (done) {
    expect(1 + 1, 'to be', 2)
    done()
})
