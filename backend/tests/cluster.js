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
        expect(body.length, 'to be', 0)

        done()
      })
  })
  var cluster = null
  lab.test('POST /', function (done) {
    request({
      method: 'POST',
      uri: appUrl + '/clusters',
      json: true,
      headers: {
        'Authorization': adminToken
      },
      body: {
        type: 'test_swarm',
        machines: 2,
        ca: 'ca certificate',
        cert: 'certificate',
        key: 'key file',
        memory: 2048
      }
    }).spread(function (response, body) {
      cluster = body._id
      expect(response.statusCode, 'to be', 200)
      expect(body, 'to satisfy', {
        type: 'test_swarm'
      })
      done()
    }).catch(function (err) {
      console.log(err)
    })
  })
  var CLUSTER_FIXTURE_ID = "555cb1e2fc27fe6f5f540002"
  lab.test('GET cluster usage', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/clusters/' + CLUSTER_FIXTURE_ID + '/usage',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      },
      function(error, response, body) {
        expect(body, 'to equal', { memoryUsed: 512, limit: 2048, count: 1 })
        done()
      })
  })
})
