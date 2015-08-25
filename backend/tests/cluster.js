var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../startdev')()

lab.experiment('/clusters', function() {
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

  lab.test('GET /', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/clusters',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })
  lab.test('POST /', function (done) {
    request({
      method: 'POST',
      uri: appUrl + '/clusters',
      json: true,
      headers: {
        'Authorization': adminToken
      },
      body: {
        type: 'swarm',
        machines: 2,
        ca: 'ca certificate',
        cert: 'certificate',
        key: 'key file'
      }
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    }).catch(function (err) {
      console.log(err)
    })
  })
})
