var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var request = require('request');

var appUrl = 'http://localhost:8000'
var hrTime = process.hrtime();
var time = (hrTime[0] * 1000000 + hrTime[1] / 1000)
var testUserEmail = 'user+'+time+'@jambroo.com'
var testContactEmail = 'contact+'+time+'@jambroo.com'
var testSignupEmail = 'signup+'+time+'@jambroo.com'

//server.route({
//  method: 'POST',
//  path: '/user',
//  handler: userRoutes.postUser
//})
var createdUserId = -1;
lab.experiment('/user', {parallel: false}, function () {
  var postUserRequestResponse = null;

  lab.before(function (done) {
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
        postUserRequestResponse = body;
        createdUserId = postUserRequestResponse.userId;
        done();
      })
  });

  lab.test('POST', {parallel: false}, function (done) {
    Code.expect(postUserRequestResponse.status).to.equal('User successfully added.');
    done();
  });
});

//server.route({
//  method: 'POST',
//  path: '/login',
//  handler: userRoutes.postLogin
//});
lab.experiment('/login', {parallel: false}, function () {
  var loginRequestResponse = null;

  lab.before(function (done) {
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
        loginRequestResponse = body;
        done();
      })
  });

  lab.test('POST', {parallel: false}, function (done) {
    Code.expect(loginRequestResponse.status).to.equal('Login successful.');
    Code.expect(loginRequestResponse.token).to.be.a.string()
    done();
  });
});

//server.route({
//  method: 'POST',
//  path: '/contact',
//  handler: frontRoutes.postContact
//});
lab.experiment('/contact', { parallel: false }, function () {
  var postContactResponse = null;

  lab.before(function (done) {
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
        postContactResponse = body
        done();
      })
  });

  lab.test('POST', { parallel: false }, function (done) {
    Code.expect(postContactResponse.status).to.equal("OK")
    done();
  });
});

//server.route({
//  method: 'GET',
//  path: '/admin/user',
//  handler: adminRoutes.getAdminUser
//})
lab.experiment('/admin/user GET', { parallel: false }, function () {
  var getAdminUserResponse = null;
  var getAdminUsersResponse = null;
  var getAdminUsersInvalidAuthResponse = null;

  lab.before(function (done) {
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

            request({
                method: 'GET',
                uri: appUrl+'/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&userId='+createdUserId,
                headers: {
                  'Content-Type': 'application/json'
                },
                json: true
              },
              function (error, response, body) {
                getAdminUserResponse = body
                done();
              })
          })
      })
  });

  lab.test('status', { parallel: false }, function (done) {
    Code.expect(getAdminUsersInvalidAuthResponse).to.equal("Invalid Admin Authorization Code.")
    Code.expect(getAdminUsersResponse).to.be.a.array()
    Code.expect(getAdminUsersResponse[0]).to.be.an.object();
    Code.expect(getAdminUsersResponse[0]._id).to.be.a.string()
    Code.expect(getAdminUserResponse.email).to.equal(testUserEmail)

    done();
  });
});

//server.route({
//  method: 'PUT',
//  path: '/admin/user',
//  handler: adminRoutes.putAdminUser
//})
lab.experiment('/admin/user PUT', { parallel: false }, function () {
  var putAdminUserResponse = null;

  lab.before(function (done) {
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
        putAdminUserResponse = body
        done();
      })
  });

  lab.test('status', { parallel: false }, function (done) {
    Code.expect(putAdminUserResponse).to.equal("User successfully updated.")

    done();
  });
});

//server.route({
//  method: 'DELETE',
//  path: '/admin/user',
//  handler: adminRoutes.deleteAdminUser
//})
lab.experiment('/admin/user DELETE', { parallel: false }, function () {
  var putAdminUserResponse = null;

  lab.before(function (done) {
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
        putAdminUserResponse = body
        done();
      })
  });

  lab.test('status', { parallel: false }, function (done) {
    Code.expect(putAdminUserResponse).to.equal("User successfully removed.")

    done();
  });
});

//server.route({
//  method: 'POST',
//  path: '/presignup',
//  handler: frontRoutes.postSignup
//})
lab.experiment('/presignup', { parallel: false }, function () {
  var postPresignup = null;
  var postPresignupClash = null;

  lab.before(function (done) {
    var requestData = {
      email: testSignupEmail
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
            postPresignupClash = body
            done();
          })
      })
  });

  lab.test('status', { parallel: false }, function (done) {
    Code.expect(postPresignup.status).to.equal("You have successfully signed up for the waiting list.")
    //Code.expect(postPresignupClash).to.equal("Already signed up.")

    done();
  });
});

//server.route({
//  method: 'GET',
//  path: '/preusers',
//  handler: preUsersRoutes.getPreUsers
//})
//
lab.experiment('/preusers', { parallel: false }, function () {
  var preusersResponse = null;

  lab.before(function (done) {
    request({
        method: 'GET',
        uri: appUrl+'/preusers',
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      },
      function (error, response, body) {
        preusersResponse = body
        done();
      })
  });

  lab.test('status', { parallel: false }, function (done) {
    Code.expect(preusersResponse).to.be.a.array()
    Code.expect(preusersResponse[0]).to.be.an.object();
    Code.expect(preusersResponse[0]._id).to.be.a.string()
    Code.expect(preusersResponse[preusersResponse.length-1].email).to.equal(testSignupEmail)

    done();
  });
});
