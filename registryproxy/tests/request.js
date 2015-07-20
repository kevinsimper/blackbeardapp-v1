var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var server = require('../server')
var request = require('request')
var child_process = require('child_process')

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

lab.before(function(done) {
  server.start(function() {
    console.log('Server running at:', server.info.uri)
    done()
  })
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

lab.test('valid login and password', function(done) {
  var user = {
    username: 'blackbeard',
    password: 'password'
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

lab.test('invalid login and password', function(done) {
  var user = {
    username: 'invalid',
    password: 'invalid'
  }
  var url = 'https://' + user.username + ':' + user.password + '@' + server.info.host + ':' + server.info.port + '/'
  request.get({
    url: url,
    rejectUnauthorized: false,
    json: true
  }, function(error, response, body) {
    expect(response.statusCode, 'to be', 401)
    done()
  })
})


lab.test('/v1/_ping', function(done) {
  var user = {
    username: 'invalid',
    password: 'invalid'
  }
  var url = 'https://' + user.username + ':' + user.password + '@' + server.info.host + ':' + server.info.port + '/v1/_ping'
  request.get({
    url: url,
    rejectUnauthorized: false,
    json: true
  }, function(error, response, body) {
    expect(body, 'to be', 'V2 registry')
    done()
  })
})


