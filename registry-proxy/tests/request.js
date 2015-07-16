var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var server = require('../server')
var request = require('request')
var child_process = require('child_process')

server.start(function() {
  console.log('Server running at:', server.info.uri)
  var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
    encoding: 'utf8'
  })

  lab.test('get registry output', function(done) {
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

  lab.test('get registry output', function(done) {
    var url = 'https://' + server.info.uri + ':9500/v2/'
    request.get({
      url: url,
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(typeof body, 'to be', typeof {})
      done()
    })
  })
})

