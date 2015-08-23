var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('../helpers/')
var appUrl = helpers.appUrl()

var server = require('../../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

var adminToken = ''
lab.before(function(done) {
  request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: {
        email: 'admin@blackbeard.io',
        password: 'password'
      }
    },
    function(error, response, body) {
      adminToken = body.token
      done()
    })
})

lab.test('GET cluster/status', function (done) {
  request({
    method: 'GET',
    uri: appUrl + '/clusters/55d9a1d59fa1480f006f8bbc/status',
    json: true,
    headers: {
      'Authorization': adminToken
    }
  }, function (error, response, body) {
    console.log('body', body)
    expect(response.statusCode, 'to be', 200)
    done()
  })
})
