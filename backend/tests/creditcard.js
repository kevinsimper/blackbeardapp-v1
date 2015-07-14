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

lab.experiment('/users/{id}/creditcards', function() {
  var token = null
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

  lab.test('POST', function(done) {
      var requestData = {
        name: 'New Card',
        creditcard: '4111111111111111',
        expiryMonth: '06',
        expiryYear: '2018',
        cvv: '123'
      }
      request({
        method: 'POST',
        uri: appUrl + '/users/me/creditcards',
        headers: {
          'Authorization': token
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        expect(body.stripeToken, 'not to be empty')
        done()
      })
  })

  lab.test('DELETE', function(done) {
      var requestData = {
        name: 'New Card'
      }
      request({
        method: 'DELETE',
        uri: appUrl + '/users/me/creditcards/' + requestData.name,
        headers: {
          'Authorization': token
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })
})
