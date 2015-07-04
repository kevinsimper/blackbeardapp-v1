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

//server.route({
//  method: 'POST',
//  path: '/user',
//  handler: userRoutes.postUser
//})
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
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        Code.expect(body.status).to.equal('User successfully added.')
        createdUserId = body.userId
        done()
      })
  })
})

//server.route({
//  method: 'POST',
//  path: '/login',
//  handler: userRoutes.postLogin
//})
lab.experiment('/login', function() {
  lab.test('POST', function(done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }

    request({
        method: 'POST',
        uri: appUrl + '/login',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        Code.expect(body.status).to.equal('Login successful.')
        Code.expect(body.token).to.be.a.string()
        token = body.token
        done()
      })
  })
})

//server.route({
//  method: 'POST',
//  path: '/contact',
//  handler: frontRoutes.postContact
//})
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
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        Code.expect(body.status).to.equal("OK")
        done()
      })
  })
})

//server.route({
//  method: 'GET',
//  path: '/admin/user',
//  handler: adminRoutes.getAdminUser
//})
lab.experiment('/admin/user GET', function() {
  lab.test('status', function(done) {
    var getAdminUserResponse = null
    var getAdminUsersResponse = null
    var getAdminUsersInvalidAuthResponse = null

    var inviteUser = function() {
      request({
          method: 'GET',
          uri: appUrl + '/admin/invite?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&userId=' + createdUserId,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          json: true
        },
        function(error, response, body) {
          Code.expect(getAdminUsersInvalidAuthResponse).to.equal("Invalid Admin Authorization Code.")
          Code.expect(getAdminUsersResponse).to.be.a.array()
          Code.expect(getAdminUsersResponse[0]).to.be.an.object()
          Code.expect(getAdminUsersResponse[0]._id).to.be.a.string()
          Code.expect(getAdminUserResponse.email).to.equal(testUserEmail)
          Code.expect(getAdminUserResponse.credit).to.equal(0)

          Code.expect(body.status).to.equal("Invitation successfully sent.")

          done()
        })
    }

    var getAdminUser = function() {
      request({
          method: 'GET',
          uri: appUrl + '/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&userId=' + createdUserId,
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        },
        function(error, response, body) {
          getAdminUserResponse = body
          inviteUser()
        })
    }

    var getAdminUsers = function() {
      request({
          method: 'GET',
          uri: appUrl + '/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        },
        function(error, response, body) {
          getAdminUsersResponse = body

          getAdminUser()
        })
    }

    request({
        method: 'GET',
        uri: appUrl + '/admin/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      },
      function(error, response, body) {
        getAdminUsersInvalidAuthResponse = body

        getAdminUsers()
      })
  })
})

//server.route({
//  method: 'PUT',
//  path: '/admin/user',
//  handler: adminRoutes.putAdminUser
//})
lab.experiment('/admin/user PUT', function() {
  lab.test('status', function(done) {
    var requestData = {
      admin: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      userId: createdUserId,
      email: testUserEmail,
      password: 'password_new'
    }

    request({
        method: 'PUT',
        uri: appUrl + '/admin/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        Code.expect(body).to.equal("User successfully updated.")
        done()
      })
  })
})

//server.route({
//  method: 'POST',
//  path: '/presignup',
//  handler: frontRoutes.postSignup
//})
lab.experiment('/presignup', function() {
  var postPresignup = null

  lab.test('status', function(done) {
    var requestData = {
      email: testSignupEmail
    }

    var postSignupClash = function() {
      request({
          method: 'POST',
          uri: appUrl + '/presignup',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true,
          body: requestData
        },
        function(error, response, body) {
          Code.expect(postPresignup.status).to.equal("You have successfully signed up for the waiting list.")
            //Code.expect(body).to.equal("Already signed up.")

          done()
        })
    }

    request({
        method: 'POST',
        uri: appUrl + '/presignup',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        postPresignup = body

        postSignupClash()
      })
  })

})

//server.route({
//  method: 'GET',
//  path: '/preusers',
//  handler: preUsersRoutes.getPreUsers
//})
//
lab.experiment('/preusers', function() {
  lab.test('status', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/preusers',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      },
      function(error, response, body) {
        Code.expect(body).to.be.a.array()
        Code.expect(body[0]).to.be.an.object()
        Code.expect(body[0]._id).to.be.a.string()
        Code.expect(body[body.length - 1].email).to.equal(testSignupEmail)

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
  //server.route({
  //  method: 'POST',
  //  path: '/forgot',
  //  handler: userRoutes.postForgot
  //})
  lab.test('send', function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/forgot',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: {
          email: testUserEmail
        }
      },
      function(error, response, body) {
        Code.expect(body).to.deep.equal({"status": "Reset password link successfully sent."})

        done()
      })
  })

  //server.route({
  //  method: 'POST',
  //  path: '/forgot',
  //  handler: userRoutes.postForgotReset
  //})
  lab.test('click link', function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/forgot/PredictableToken',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: {
          password: 'password_new2'
        }
      },
      function(error, response, body) {
        Code.expect(body.status).to.equal("Password successfully reset.")
        Code.expect(body.token).to.be.a.string()

        done()
      })
  })
})

lab.experiment('/user/{id}/creditcard', function() {
  //server.route({
  //  method: 'POST',
  //  path: '/user/{id}/creditcard',
  //  handler: userRoutes.postCreditCard
  //})
  lab.test('send', function(done) {
      var requestData = {
        name: 'New Card',
        creditcard: '4111111111111111',
        expiryMonth: '06',
        expiryYear: '2018',
        cvv: '123'
      }
      request({
        method: 'POST',
        uri: appUrl + '/user/' + createdUserId + '/creditcard',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(body, 'to equal', { status: 'Creditcard successfully saved.' });

        done()
      })
  })

  lab.test('delete', function(done) {
      var requestData = {
        name: 'New Card'
      }
      request({
        method: 'DELETE',
        uri: appUrl + '/user/' + createdUserId + '/creditcard',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        expect(body, 'to equal', { status: 'Creditcard successfully removed.' });

        done()
      })
  })
})

//server.route({
//  method: 'DELETE',
//  path: '/admin/user',
//  handler: adminRoutes.deleteAdminUser
//})
lab.experiment('/admin/user DELETE', function() {
  lab.test('status', function(done) {
    var requestData = {
      admin: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      userId: createdUserId
    }

    request({
        method: 'DELETE',
        uri: appUrl + '/admin/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function(error, response, body) {
        Code.expect(body).to.equal("User successfully removed.")
        done()
      })
  })
})

//TODO: Test if orphaned apps exist after user removed
