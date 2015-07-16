var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var server = require('../server')
var request = require('request')
var child_process = require('child_process')

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

lab.test('get registry output', function(done) {
  var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
    encoding: 'utf8'
  })
  var url = 'http://' + ip.trim() + ':5000/v2/'
  request.get({
    url: url,
    json: true
  }, function(error, response, body) {
    expect(response.statusCode, 'to be', 200)
    expect(typeof body, 'to be', typeof {})
    done()
  })
})
