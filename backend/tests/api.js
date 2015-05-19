var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var request = require('request');
var Q = require('q');

var hrTime = process.hrtime();
var time = (hrTime[0] * 1000000 + hrTime[1] / 1000)
var createdUserId = -1;

// TODO:
//server.route({
//  method: 'GET',
//  path: '/preusers',
//  handler: preUsersRoutes.getPreUsers
//})
//
//server.route({
//  method: 'POST',
//  path: '/presignup',
//  handler: frontRoutes.postSignup
//})
//
//server.route({
//  method: 'PUT',
//  path: '/admin/user',
//  handler: adminRoutes.putAdminUser
//})
//
//server.route({
//  method: 'DELETE',
//  path: '/admin/user',
//  handler: adminRoutes.deleteAdminUser
//})
//
//server.route({
//  method: 'POST',
//  path: '/login',
//  handler: userRoutes.postLogin
//});




//server.route({
//  method: 'POST',
//  path: '/user',
//  handler: userRoutes.postUser
//})
function testPostUserRequest() {
  var deferred = Q.defer();

  var requestData = JSON.stringify({
    email: 'j+'+time+'@j.com',
    password: 'password'
  })

  request({
      har: {
        url: 'http://localhost:8000/user',
        method: 'POST',
        headers: [
          {
            name: 'content-type',
            value: 'application/json'
          }
        ],
        postData: {
          mimeType: 'application/json',
          text: requestData
        }
      }
    },
    function (error, response, body) {
      deferred.resolve(body);
    }
  );

  return deferred.promise
}

//server.route({
//  method: 'POST',
//  path: '/contact',
//  handler: frontRoutes.postContact
//});

function testPostContactRequest(p) {
  var deferred = Q.defer();
  var requestData = JSON.stringify({
    email: 'j+contact+'+time+'@j.com',
    name: 'James',
    message: 'This is a test message.'
  })

  request({
      har: {
        url: 'http://localhost:8000/contact',
        method: 'POST',
        headers: [
          {
            name: 'content-type',
            value: 'application/json'
          }
        ],
        postData: {
          mimeType: 'application/json',
          text: requestData
        }
      }
    },
    function (error, response, body) {
      deferred.resolve(body.status);
    }
  );

  return deferred.promise
}

//server.route({
//  method: 'GET',
//  path: '/admin/user',
//  handler: adminRoutes.getAdminUser
//})
function getAdminUsersNoAuthRequest() {
  var deferred = Q.defer();

  console.log('Running getadmin user ', createdUserId)

  request({
      har: {
        url: 'http://localhost:8000/admin/user',
        method: 'GET',
        headers: [
          {
            name: 'content-type',
            value: 'application/json'
          }
        ]
      }
    },
    function (error, response, body) {
      deferred.resolve(body);
    }
  );

  return deferred.promise
}

function getAdminUsersRequest() {
  var deferred = Q.defer();

  console.log('Running getadmin user ', createdUserId)

  request({
      har: {
        url: 'http://localhost:8000/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        method: 'GET',
        headers: [
          {
            name: 'content-type',
            value: 'application/json'
          }
        ]
      }
    },
    function (error, response, body) {
      deferred.resolve(body)
    }
  );

  return deferred.promise
}

function getAdminUserRequest() {
  var deferred = Q.defer();

  console.log('Running getadmin user ', createdUserId)

  request({
      har: {
        url: 'http://localhost:8000/admin/user?admin=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&userId='+createdUserId,
        method: 'GET',
        headers: [
          {
            name: 'content-type',
            value: 'application/json'
          }
        ]
      }
    },
    function (error, response, body) {
      console.log('MADE REQ');
      console.log([error, response, body]);

      deferred.resolve(body)
    }
  )

  return deferred.promise
}

lab.test('All tests', function (done) {
  // Could chain together these requests and THEN do testing
  testPostUserRequest()
    .then(testPostContactRequest)
    .then(getAdminUsersNoAuthRequest)
    .then(getAdminUsersRequest)
    .then(getAdminUserRequest)
    .then(function() {
      done()
    })
});

