var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var server = require('../server')
var request = require('request')

server.start(function() {
  console.log('Server running at:', server.info.uri)
})

lab.test('returns true when 1 + 1 equals 2', function (done) {
  request.get({
    url: 'https://localhost:9500',
    rejectUnauthorized: false
  }, function(error, response, body) {
    expect(response.statusCode, 'to be', 200)
    done()
  })
})
