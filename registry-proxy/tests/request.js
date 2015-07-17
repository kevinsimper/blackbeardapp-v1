var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var server = require('../server')
var request = require('request')
var child_process = require('child_process')

console.log('Server running at:', server.info.uri)
var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

lab.test('get registry output', function(done) {
  server.start(function() {
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
})

lab.test('get registry output', function(done) {
  var user = {
    username: 'admin+users@blackbeard.io',
    password: 'password_new'
  }
  var url = 'https://' + user.username + ':' + user.password + '@' + server.info.host + ':' + server.info.port + '/'
  request.get({
    url: url,
    rejectUnauthorized: false,
    json: true
  }, function(error, response, body) {
    expect(response.statusCode, 'to be', 200)
    expect(typeof body, 'to be', typeof {})
    done()
  })
})

