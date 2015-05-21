var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var request = require('request')

var appUrl = 'http://localhost:8000'
var hrTime = process.hrtime()
var time = (hrTime[0] * 1000000 + hrTime[1] / 1000)
var testUserEmail = 'user+'+time+'@jambroo.com'
var testContactEmail = 'contact+'+time+'@jambroo.com'
var testSignupEmail = 'signup+'+time+'@jambroo.com'

//server.route({
//  method: 'POST',
//  path: '/user',
//  handler: userRoutes.postUser
//})
var createdUserId = -1
lab.experiment('/user', function () {
  lab.test('POST', function (done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }

    request({
        method: 'POST',
        uri: appUrl+'/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
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
lab.experiment('/login', function () {
  lab.test('POST', function (done) {
    var requestData = {
      email: testUserEmail,
      password: 'password'
    }

    request({
        method: 'POST',
        uri: appUrl+'/login',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        Code.expect(body.status).to.equal('Login successful.')
        Code.expect(body.token).to.be.a.string()
        done()
      })
  })
})

//server.route({
//  method: 'POST',
//  path: '/contact',
//  handler: frontRoutes.postContact
//})
lab.experiment('/contact', function () {
  lab.test('POST', function (done) {
    var requestData = {
      email: testContactEmail,
      name: 'James',
      message: 'This is a test message.'
    }

    request({
        method: 'POST',
        uri: appUrl+'/contact',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
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
lab.experiment('/admin/user GET', function () {
  lab.test('status', function (done) {
    var getAdminUserResponse = null
    var getAdminUsersResponse = null
    var getAdminUsersInvalidAuthResponse = null

    var getAdminUser = function() {
      request({
          method: 'GET',
          uri: appUrl+'/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&userId='+createdUserId,
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        },
        function (error, response, body) {
          Code.expect(getAdminUsersInvalidAuthResponse).to.equal("Invalid Admin Authorization Code.")
          Code.expect(getAdminUsersResponse).to.be.a.array()
          Code.expect(getAdminUsersResponse[0]).to.be.an.object()
          Code.expect(getAdminUsersResponse[0]._id).to.be.a.string()
          Code.expect(body.email).to.equal(testUserEmail)

          done()
        })
    }

    var getAdminUsers = function () {
      request({
          method: 'GET',
          uri: appUrl+'/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        },
        function (error, response, body) {
          getAdminUsersResponse = body

          getAdminUser()
        })
    }

    request({
        method: 'GET',
        uri: appUrl+'/admin/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      },
      function (error, response, body) {
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
lab.experiment('/admin/user PUT', function () {
  lab.test('status', function (done) {
    var requestData = {
      admin: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      userId: createdUserId,
      email: testUserEmail,
      password: 'password_new'
    }

    request({
        method: 'PUT',
        uri: appUrl+'/admin/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        Code.expect(body).to.equal("User successfully updated.")
        done()
      })
  })
})

//server.route({
//  method: 'DELETE',
//  path: '/admin/user',
//  handler: adminRoutes.deleteAdminUser
//})
lab.experiment('/admin/user DELETE', function () {
  lab.test('status', function (done) {
    var requestData = {
      admin: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      userId: createdUserId
    }

    request({
        method: 'DELETE',
        uri: appUrl+'/admin/user',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
        Code.expect(body).to.equal("User successfully removed.")
        done()
      })
  })
})

//server.route({
//  method: 'POST',
//  path: '/presignup',
//  handler: frontRoutes.postSignup
//})
lab.experiment('/presignup', function () {
  var postPresignup = null

  lab.test('status', function (done) {
    var requestData = {
      email: testSignupEmail
    }

    var postSignupClash = function() {
      request({
          method: 'POST',
          uri: appUrl+'/presignup',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true,
          body: requestData
        },
        function (error, response, body) {
          Code.expect(postPresignup.status).to.equal("You have successfully signed up for the waiting list.")
          //Code.expect(body).to.equal("Already signed up.")

          done()
        })
    }

    request({
        method: 'POST',
        uri: appUrl+'/presignup',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
      },
      function (error, response, body) {
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
lab.experiment('/preusers', function () {
  lab.test('status', function (done) {
    request({
        method: 'GET',
        uri: appUrl+'/preusers',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      },
      function (error, response, body) {
        Code.expect(body).to.be.a.array()
        Code.expect(body[0]).to.be.an.object()
        Code.expect(body[0]._id).to.be.a.string()
        Code.expect(body[body.length-1].email).to.equal(testSignupEmail)

        done()
      })
})
});