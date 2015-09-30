var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../startdev')()

lab.experiment('/users', function () {
  var token
  var testUserEmail = 'user+test+creation@blackbeard.io'
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
      },
      function (error, response, body) {
        token = body.token
        done()
      })
  })

  lab.test('/notify/image', function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/webhook/notify/image',
      json: true,
      body: {
        user: 'blackbeard',
        name: 'busybox',
        dockerContentDigest: 'sha4878978946456456'
      }
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })

  lab.test('/notify/image unknown user', function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/webhook/notify/image',
      json: true,
      body: {
        user: 'unknown',
        name: 'busybox',
        dockerContentDigest: 'sha4878978946456456'
      }
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })

  lab.test('GET /me/images', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me/images',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function (error, response, body) {
        expect(body[body.length - 1], 'to satisfy', {name: 'busybox'})
        done()
      })
  })
})
