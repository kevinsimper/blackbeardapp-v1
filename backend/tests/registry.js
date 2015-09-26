var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../startdev')()

lab.experiment('/registry/images', function () {
  var adminToken
  var userId

  lab.before(function (done) {
    request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: {
        email: 'admin@blackbeard.io',
        password: 'password'
      }
    }).spread(function (response, body) {
      adminToken = body.token
      done()
    })
  })

  lab.test('/registry/images', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/registry/images',
      headers: {
        'Authorization': adminToken
      },
      json: true,
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.length, 'to be', 2)
      done()
    })
  })

  lab.test('/registry/synchronise', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/registry/synchronise',
      headers: {
        'Authorization': adminToken
      },
      json: true,
    }).spread(function(response, body) {
      console.log(body)
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
})
