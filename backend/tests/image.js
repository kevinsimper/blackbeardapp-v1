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

lab.experiment('/users', function() {
  var token
  var testUserEmail = 'user+test+creation@blackbeard.io'
  var userId

/*
  lab.before(function(done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }

    request({
      method: 'POST',
      uri: appUrl + '/users',
      json: true,
      body: requestData
    })
      .spread(function(response, body) {
        expect(response.statusCode, 'to be', 200)
        return request({
          method: 'POST',
          uri: appUrl + '/login',
          json: true,
          body: requestData
        })
      })
      .spread(function(response, body) {
        expect(response.statusCode, 'to be', 200)
        token = body.token
        done()
      })
      .catch(function(err) {
        console.log(err)
      })
  })

  lab.test('GET /me/images', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me/images',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        //expect(response.statusCode, 'to be', 200)
        //// User should not have creditcard details attached as we are querying not as ADMIN but USER
        //expect(response.creditCards, 'to be', undefined)
        //userId = body._id
        done()
      })
  })
*/
})
