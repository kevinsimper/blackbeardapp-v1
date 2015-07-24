var Lab = require('lab')
var lab = exports.lab = Lab.script()
var request = require('request')
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

lab.experiment('/users/{id}/creditcards', function() {
  var token = null
  var userId = null
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
        done()
      })
  })

  lab.test('POST invalid', function(done) {
      var requestData = {
        name: 'New Card',
        creditcard: '12',
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
        expect(body.statusCode, 'to be', 400)
        expect(body.message, 'to be', 'This card number looks invalid.')
        done()
      })
  })

  lab.test('POST test card 2', function(done) {
    var requestData = {
      name: 'Special empty card',
      creditcard: '4000000000000002',
      expiryMonth: '01',
      expiryYear: '2019',
      cvv: '456'
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
        done()
      })
  })

  lab.test('GET admins', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        var admin = _.filter(body, function(user) {
          return user.email == 'admin+users@blackbeard.io';
        })
        userId = admin[0]._id
        done()
      })
  })

  var creditCardId = null
  var emptyCreditCardId = null
  lab.test('GET admin', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/'+userId,
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        expect(body.creditCards[0].number, 'to be', '1234')
        expect(body.creditCards[0].token, 'to be', undefined)
        creditCardId = body.creditCards[1]._id
        emptyCreditCardId = body.creditCards[2]._id
        done()
      })
  })

  lab.test('GET', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/'+userId+'/creditcards',
        headers: {
          'Authorization': token
        },
        json: true
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })

  lab.test('GET particular credit card', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + userId + '/creditcards/' + creditCardId,
        headers: {
          'Authorization': token
        },
        json: true
      },
      function(error, response, body) {
        expect(body.number, 'to be', '1111')
        done()
      })
  })

  lab.test('GET particular credit card that does not exist', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + userId + '/creditcards/someIdThatDoesntExist',
        headers: {
          'Authorization': token
        },
        json: true
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 404)
        done()
      })
  })

  lab.test('POST charge user', function(done) {
    var requestData = {
      name: 'New Charge',
      amount: 50 // 50 cent charge
    }
    request({
        method: 'POST',
        uri: appUrl + '/users/' + userId + '/creditcards/' + creditCardId + '/charge',
        headers: {
          'Authorization': token
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(body.message, 'to be', 'Payment successfully made.')
        done()
      })
  })

  lab.test('POST charge user with empty card', function(done) {
    var requestData = {
      name: 'New Charge',
      amount: 50 // 50 cent charge
    }
    request({
        method: 'POST',
        uri: appUrl + '/users/' + userId + '/creditcards/' + emptyCreditCardId + '/charge',
        headers: {
          'Authorization': token
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(body, 'to equal', {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Your card was declined.'
        })

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
