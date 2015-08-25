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
var clusterId = ''
lab.before(function(done) {
  var admin = request({
    method: 'POST',
    uri: appUrl + '/login',
    json: true,
    body: {
      email: 'admin@blackbeard.io',
      password: 'password'
    }
  }).spread(function(response, body) {
    adminToken = body.token
    return adminToken
  })
  var cluster = admin.then(function (adminToken) {
    return request({
      method: 'GET',
      uri: appUrl + '/clusters',
      headers: {
        'Authorization': adminToken
      },
      json: true
    })
  }).spread(function(response, body) {
    clusterId = body[0]._id
    done()
  }).catch(function (err) {
    console.log(err)
  })
})

lab.test('GET cluster/status', function (done) {
  console.log(appUrl + '/clusters/' + clusterId + '/status')
  request({
    method: 'GET',
    uri: appUrl + '/clusters/' + clusterId + '/status',
    json: true,
    headers: {
      'Authorization': adminToken
    }
  }, function (error, response, body) {
    expect(response.statusCode, 'to be', 200)
    done()
  })
})

lab.test('GET cluster/containers', function (done) {
  request({
    method: 'GET',
    uri: appUrl + '/clusters/' + clusterId + '/containers',
    json: true,
    headers: {
      'Authorization': adminToken
    }
  }, function (error, response, body) {
    expect(response.statusCode, 'to be', 200)
    done()
  })
})
