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

var token = null
lab.experiment('/app', function() {
  var appId = null
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
      name: 'Test App',
      cname: 'testapp'
    }
    request({
        method: 'POST',
        uri: appUrl + '/users/me/apps',
        headers: {
          'Authorization': token
        },
        body: requestData,
        json: true
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        expect(body.name, 'to be', requestData.name)
        appId = body._id
        done()
      })
  })
  lab.test('PUT', function(done) {
    var requestData = {
      name: 'Test App Updated',
      cname: 'testapp'
    }
    request({
      method: 'PUT',
      uri: appUrl + '/users/me/apps/' + appId,
      headers: {
        'Authorization': token
      },
      body: requestData,
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.name, 'to be', requestData.name)
      done()
    })
  })
  lab.test('GET', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps',
      headers: {
        'Authorization': token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body, 'to be non-empty')
      done()
    })
  })
  lab.test('Search POST', function(done) {
    var requestData = {
      cname: 'testapp'
    }
    request({
      method: 'POST',
      uri: appUrl + '/apps',
      body: requestData,
      headers: {
        'Authorization': token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body, 'to be non-empty', 'name')
      done()
    })
  })
  lab.test('DELETE', function(done) {
    request({
      method: 'DELETE',
      uri: appUrl + '/users/me/apps/' + appId,
      headers: {
        'Authorization': token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
  lab.test('GET with deleted', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps',
      headers: {
        'Authorization': token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.pop().deleted, 'to be', true)
      done()
    })
  })
})

lab.experiment('/app/containers', function() {
  var appId = null
  var containerId = null
  lab.before(function(done) {
    var requestData = {
      name: 'Test App Container'
    }
    request({
        method: 'POST',
        uri: appUrl + '/users/me/apps',
        headers: {
          'Authorization': token
        },
        body: requestData,
        json: true
      },
      function(error, response, body) {
        expect(response.statusCode, 'to be', 200)
        expect(body.name, 'to be', requestData.name)
        appId = body._id
        done()
      })
  })
  lab.test('POST', function(done) {
    var requestData = {
      region: 'eu'
    }
    request({
      method: 'POST',
      uri: appUrl + '/users/me/apps/' + appId + '/containers',
      headers: {
        Authorization: token
      },
      json: true,
      body: requestData
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body, 'to have keys', 'region', 'status')
      containerId = body._id
      done()
    })
  })
  lab.test('GET', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps/' + appId + '/containers',
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(body, 'to be non-empty')
      done()
    })
  })
  lab.test('GET container', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps/' + appId + '/containers/' + containerId,
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(body.status, 'to be', 'Starting')
      done()
    })
  })
  lab.test('DELETE', function(done) {
    request({
      method: 'DELETE',
      uri: appUrl + '/users/me/apps/' + appId + '/containers/' + containerId,
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
})
