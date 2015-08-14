var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

lab.experiment('/logs', function () {
  var adminToken;
  lab.before(function (done) {
    var adminRequestData = {
      email: 'admin@blackbeard.io',
      password: 'password'
    }
    var adminUser = request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: adminRequestData
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      adminToken = body.token
      done()
      return adminToken
    })
  })
  lab.test('GET', function (done) {
    request({
      method: 'GET',
      uri: appUrl + '/logs',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
})
