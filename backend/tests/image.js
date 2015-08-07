var Lab = require('lab')
var lab = exports.lab = Lab.script()
var request = require('request')
var expect = require('unexpected')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

var token = null
lab.experiment('/app', function() {
  var appId = null
  lab.before(function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/login',
        json: true,
        body: {
          email: 'admin+users@blackbeard.io',
          password: 'password'
        }
      },
      function(error, response, body) {
        token = body.token
        done()
      })
  })
  lab.test('GET', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/images',
      headers: {
        'Authorization': token
      },
      json: true
    }, function(error, response, body) {
      expect(body, 'to be non-empty')
      expect(body[0].name, 'to be', 'Example Image')
      done()
    })
  })
})
