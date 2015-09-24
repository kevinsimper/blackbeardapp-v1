var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')
var System = require('../models/System')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../startdev')()

lab.experiment('Set system offline', function() {
  var adminToken = null

  lab.before(function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: {
        email: 'admin@blackbeard.io',
        password: 'password'
      }
    }).spread(function(response, body) {
      adminToken = body.token
      done()      
    }).catch(function(err) {
      console.log(err)
    })
  })

  lab.test('create user', function(done) {
    request({
      method: 'PUT',
      uri: appUrl + '/panic',
      json: true,
      headers: {
        'Authorization': adminToken
      },
      body: {
        state: false
      }
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
})
