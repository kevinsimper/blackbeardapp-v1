var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function () {
  console.log('Server running at:', server.info.uri)
})

lab.experiment('/users/{id}/creditcards', function () {
  var adminToken = null
  var userToken = null
  var adminUserId = null
  var userId = null
  lab.before(function (done) {
    request({
        method: 'POST',
        uri: appUrl + '/login',
        json: true,
        body: {
          email: 'admin+users@blackbeard.io',
          password: 'password'
        }
      },
      function (error, response, body) {
        adminToken = body.token
        done()
      })
  })

  lab.test('POST', function (done) {
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
          'Authorization': adminToken
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })

  lab.test('POST invalid', function (done) {
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
          'Authorization': adminToken
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        expect(body.statusCode, 'to be', 400)
        expect(body.message, 'to be', 'This card number looks invalid.')
        done()
      })
  })

  lab.test('POST test card 2', function (done) {
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
          'Authorization': adminToken
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })

  lab.test('GET admins and test users', function (done) {
    var requestUserLogin = {
      email: 'user+test@blackbeard.io',
      password: 'password'
    }

    request({
      method: 'POST',
      uri: appUrl + '/users',
      json: true,
      body: requestUserLogin
    })
      .spread(function (response, body) {
        expect(response.statusCode, 'to be', 200)
        return request({
          method: 'POST',
          uri: appUrl + '/login',
          json: true,
          body: requestUserLogin
        })
      })
      .spread(function (response, body) {
        userToken = body.token
        expect(response.statusCode, 'to be', 200)
        return request({
          method: 'GET',
          uri: appUrl + '/users',
          json: true,
          headers: {
            'Authorization': adminToken
          }
        })
      })
      .spread(function (response, body) {
        var admin = _.filter(body, function (user) {
          return user.email == 'admin+users@blackbeard.io';
        })
        var user = _.filter(body, function (user) {
          return user.email == 'user+test@blackbeard.io';
        })
        adminUserId = admin[0]._id
        userId = user[0]._id

        done()
      })
      .catch(function (err) {
        console.log(err)
      })
  })

  var creditCardId = null
  var emptyCreditCardId = null
  lab.test('GET admin', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + adminUserId,
        json: true,
        headers: {
          'Authorization': adminToken
        }
      },
      function (error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })

  lab.test('GET', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + adminUserId + '/creditcards',
        headers: {
          'Authorization': adminToken
        },
        json: true
      },
      function (error, response, body) {
        expect(response.statusCode, 'to be', 200)
        expect(body[0].number, 'to be', '1234')
        creditCardId = body[1]._id
        emptyCreditCardId = body[2]._id
        done()
      })
  })

  lab.test('GET particular credit card', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + adminUserId + '/creditcards/' + creditCardId,
        headers: {
          'Authorization': adminToken
        },
        json: true
      },
      function (error, response, body) {
        expect(body.number, 'to be', '1111')
        done()
      })
  })

  lab.test('GET particular credit card that does not exist', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + adminUserId + '/creditcards/someIdThatDoesntExist',
        headers: {
          'Authorization': adminToken
        },
        json: true
      },
      function (error, response, body) {
        expect(response.statusCode, 'to be', 404)
        done()
      })
  })

  lab.test('POST charge user', function (done) {
    var requestData = {
      name: 'New Charge',
      amount: 50 // 50 cent charge
    }
    request({
        method: 'POST',
        uri: appUrl + '/users/' + adminUserId + '/creditcards/' + creditCardId + '/charge',
        headers: {
          'Authorization': adminToken
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        expect(body.message, 'to be', 'Payment successfully made.')
        done()
      })
  })

  lab.test('POST charge user with empty card', function (done) {
    var requestData = {
      name: 'New Charge',
      amount: 50 // 50 cent charge
    }
    request({
        method: 'POST',
        uri: appUrl + '/users/' + adminUserId + '/creditcards/' + emptyCreditCardId + '/charge',
        headers: {
          'Authorization': adminToken
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        expect(body, 'to equal', {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Your card was declined.'
        })

        done()
      })
  })

  lab.test('GET users payment history', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me/payments',
        headers: {
          'Authorization': adminToken
        },
        json: true
      },
      function (error, response, body) {
        expect(body.length, 'to be', 2)

        done()
      })
  })
  lab.test('GET current users payment history without using /users/me URL', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + userId + '/payments',
        headers: {
          'Authorization': userToken
        },
        json: true
      },
      function(error, response, body) {
        expect(body, 'to equal', {
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid credentials'
        })

        done()
      })
  })

  lab.test("GET someone else's creditcard", function (done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/' + adminUserId + '/creditcards/' + creditCardId,
      headers: {
        'Authorization': userToken
      },
      json: true
    }, function (error, response, body) {
      expect(body.statusCode, 'to be', 401)
      expect(body.message, 'to be', 'Invalid credentials')

      done()
    })
  })

  lab.test("GET someone else's payment history", function (done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/' + adminUserId + '/payments',
      headers: {
        'Authorization': userToken
      },
      json: true
    }, function (error, response, body) {
      expect(body.statusCode, 'to be', 401)
      expect(body.message, 'to be', 'Invalid credentials')

      done()
    })
  })

  lab.test("POST activate credit card", function (done) {
    request({
      method: 'POST',
      uri: appUrl + '/users/me/creditcards/' + creditCardId + '/activate',
      headers: {
        'Authorization': adminToken
      },
      json: true
    }, function (error, response, body) {
      expect(body.message, 'to be', 'Credit card set to active.')
      done()
    })
  })

  lab.test('GET check activation of cards', function (done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me/creditcards',
        headers: {
          'Authorization': adminToken
        },
        json: true
      },
      function (error, response, body) {
        var activeCard = _.find(body, function (card) {
          return card._id == creditCardId
        })

        expect(activeCard.active, 'to be', true)

        var inactiveCards = _.filter(body, function (card) {
          return card._id != creditCardId
        })

        _.each(inactiveCards, function (inactive) {
          expect(inactive.active, 'to be', false)
        })

        done()
      })
  })

  lab.test("GET someone else's creditcards", function (done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/' + adminUserId + '/creditcards',
      headers: {
        'Authorization': userToken
      },
      json: true
    }, function (error, response, body) {
      expect(body.statusCode, 'to be', 401)
      expect(body.message, 'to be', 'You are not authorized to view other user\'s credit cards.')

      done()
    })
  })

  lab.test('DELETE', function (done) {
    request({
      method: 'DELETE',
      uri: appUrl + '/users/' + adminUserId + '/creditcards/' + creditCardId,
      headers: {
        'Authorization': adminToken
      },
      json: true
    }, function (error, response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
})
