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
  var adminToken
  var testUserEmail = 'user+test+creation@blackbeard.io'
  var userId
  lab.before(function(done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }
    var adminRequestData = {
      email: 'admin@blackbeard.io',
      password: 'password'
    }

    var basicUser = request({
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
      return token
    })
    .catch(function(err) {
      console.log(err)
    })

    var adminUser = request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: adminRequestData
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      adminToken = body.token
      return adminToken
    })
    .catch(function(err) {
      console.log(err)
    })

    Promise.all([basicUser, adminUser]).then(function() {
      done()
    })
  })

  lab.test('GET', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        expect(body, 'to be non-empty')
        done()
      })
  })
  lab.test('GET /me', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        // User should not have creditcard details attached as we are querying not as ADMIN but USER
        expect(response.creditCards, 'to be', undefined)
        userId = body._id
        done()
      })
  })
  lab.test('PUT /me', function(done) {
    var requestData = {
      email: 'updated@blackbeard.io',
      name: 'Mary Ormond'
    }

    request({
      method: 'PUT',
      uri: appUrl + '/users/me',
      json: true,
      headers: {
        'Authorization': token
      },
      body: requestData
    })
    .spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.email, 'to be', requestData.email)
      expect(body.name, 'to be', requestData.name)

      return request({
        method: 'PUT',
        uri: appUrl + '/users/me',
        json: true,
        headers: {
          'Authorization': token
        },
        body: {
          email: testUserEmail
        }
      })
    })
    .spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.email, 'to be', testUserEmail)
      done()
    })
  })
  lab.test('DELETE /me', function(done) {
    request({
        method: 'DELETE',
        uri: appUrl + '/users/me',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })
  lab.test('Try to get a delete user', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        // The user does not exist anymore
        expect(response.statusCode, 'to be', 404)
        done()
      })
  })
  lab.test('Try to get a delete user AS admin', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/' + userId,
        json: true,
        headers: {
          'Authorization': adminToken
        }
      },
      function(error, response, body) {
        // The user does not exist anymore
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })
})
