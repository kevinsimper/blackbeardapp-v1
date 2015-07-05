var server = require('../server')

var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var request = require('request')
var expect = require('unexpected');

var appUrl = 'http://localhost:8000'
var hrTime = process.hrtime()
var time = (hrTime[0] * 1000000 + hrTime[1] / 1000)
var testUserEmail = 'user+' + time + '@jambroo.com'
var testContactEmail = 'contact+' + time + '@jambroo.com'
var testSignupEmail = 'signup+' + time + '@jambroo.com'

server.start(function() {
  console.log('Server running at:', server.info.uri)
})

var createdUserId = -1
var token = -1
lab.experiment('/user', function() {
  lab.test('POST', function(done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }

    request({
        method: 'POST',
        uri: appUrl + '/user',
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        createdUserId = body.userId
        done()
      })
  })
})

lab.experiment('/login', function() {
  lab.test('POST', function(done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }

    request({
        method: 'POST',
        uri: appUrl + '/login',
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        token = body.token
        done()
      })
  })
})

lab.experiment('/contact', function() {
  lab.test('POST', function(done) {
    var requestData = {
      email: testContactEmail,
      name: 'James',
      message: 'This is a test message.'
    }

    request({
        method: 'POST',
        uri: appUrl + '/contact',
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })
})

lab.experiment('/presignup', function() {
  lab.test('status', function(done) {
    var requestData = {
      email: testSignupEmail
    }

    request({
        method: 'POST',
        uri: appUrl + '/presignup',
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        done()
      })
  })

})

lab.experiment('/preusers', function() {
  lab.test('GET', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/preusers',
        json: true
      },
      function(error, response, body) {
        expect(body, 'to be non-empty')
        done()
      })
  })
})

var appId = null
lab.experiment('/app', function() {
  lab.test('status', function(done) {
    var postBody = null;
    var getBody = null;
    var updateBody = null;
    var getApps = function() {
      request({
          method: 'GET',
          uri: appUrl + '/app',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          json: true
        },
        function(error, response, body) {
          getBody = body;
          updateApp()
        })
    }

    var updateApp = function() {
      var requestData = {
        appId: appId,
        name: 'Test App Updated'
      }
      request({
          method: 'PUT',
          uri: appUrl + '/app',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          json: true,
          body: requestData
        },
        function(error, response, body) {
          updateBody = body
          deleteApp()
        })
    }

    var deleteApp = function() {
      var requestData = {
        appId: appId
      }
      request({
          method: 'DELETE',
          uri: appUrl + '/app',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          json: true,
          body: requestData
        },
        function(error, response, body) {
          Code.expect(postBody.name).to.equal('Test App')
          Code.expect(getBody[0].name).to.equal('Test App')
          //Code.expect(updateBody.name).to.equal('Test App')
          //Code.expect(body.name).to.equal('Test App')
          
          done()
        })
    }


    var requestData = {
      name: 'Test App'
    }
    request({
        method: 'POST',
        uri: appUrl + '/app',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: requestData,
        json: true
      },
      function(error, response, body) {
        appId = body.appId
        postBody = body
        getApps()
      })

  })
})

lab.experiment('/forgot', function() {
  lab.test('POST', function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/forgot',
        json: true,
        body: {
          email: testUserEmail
        }
      },
      function(error, response, body) {
        expect(body, 'to equal', {"message": "Reset password link successfully sent."})
        done()
      })
  })

  lab.test('Change password', function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/forgot/PredictableToken',
        json: true,
        body: {
          password: 'password_new2'
        }
      },
      function(error, response, body) {
        expect(body, 'to have keys', 'message', 'token')
        done()
      })
  })
})

lab.experiment('/user/{id}/creditcards', function() {
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
        uri: appUrl + '/user/me/creditcards',
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

  lab.test('DELETE', function(done) {
      var requestData = {
        name: 'New Card'
      }
      request({
        method: 'DELETE',
        uri: appUrl + '/user/me/creditcards/' + requestData.name,
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
