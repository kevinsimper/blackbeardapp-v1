var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var app = require('../express')
var request = require('request')
var child_process = require('child_process')

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

lab.before(function(done) {
  var port = 9500
  app.listen(port, function() {
    console.log('Listening on port ' + port)
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

lab.experiment('docker interaction', function() {
  lab.test('docker pings the registry', function(done) {
    var url = 'https://' + server.info.host + ':' + server.info.port + '/v2/'
    request.get({
      url: url,
      rejectUnauthorized: false,
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 401)
      expect(response.headers, 'to satisfy', {
        'www-authenticate': 'Basic',
        'docker-distribution-api-version': 'registry/2.0'
      })
      done()
    })
  })

  lab.test('valid login and password', function(done) {
    var user = {
      username: 'blackbeard',
      password: 'password'
    }
    var url = 'https://' + user.username + ':' + user.password + '@' + server.info.host + ':' + server.info.port + '/v2/'
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
    var url = 'https://' + user.username + ':' + user.password + '@' + server.info.host + ':' + server.info.port + '/v2/'
    request.get({
      url: url,
      rejectUnauthorized: false,
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 401)
      done()
    })
  })
})
