var Promise = require('bluebird')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var request = Promise.promisify(require('request'))
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../startdev')()

var token = null
var adminToken = null
lab.experiment('/users/me/apps', function() {
  var appId = null
  lab.before(function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/login',
        json: true,
        body: {
          email: 'user@blackbeard.io',
          password: 'password'
        }
      },
      function(error, response, body) {
        token = body.token
        done()
      })
  })
  lab.before(function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/login',
        json: true,
        body: {
          email: 'admin@blackbeard.io',
          password: 'password'
        }
      },
      function(error, response, body) {
        adminToken = body.token
        done()
      })
  })

  lab.test('POST', function(done) {
    var image = request({
      method: 'GET',
      uri: appUrl + '/users/me/images',
      json: true,
      headers: {
        'Authorization': token
      }
    }).spread(function (response, body) {
      return body[0]
    })

    var newApp = image.then(function (image) {
      return request({
        method: 'POST',
        uri: appUrl + '/users/me/apps',
        headers: {
          'Authorization': token
        },
        body: {
          name: 'testa!!!@#!@#pp-new',
          image: image._id,
          ports: [80]
        },
        json: true
      })
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.name, 'to be', 'testapp-new')
      appId = body._id
    })

    Promise.all([image, newApp]).spread(function(image) {
      return request({
        method: 'POST',
        uri: appUrl + '/users/me/apps',
        headers: {
          'Authorization': token
        },
        body: {
          name: 'testapp-new',
          image: image._id,
          ports: [443]
        },
        json: true
      })
    }).spread(function(response, body) {
      expect(body.message, 'to be', 'There is already an App with this name')

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
      expect(body.length, 'to be', 2)
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
  lab.test('GET as normal user', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps',
      headers: {
        'Authorization': token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.length, 'to be', 2)
      done()
    })
  })
})

lab.experiment('/users/me/apps/containers', function() {
  var appId = null
  var containerId = null
  var imageId
  lab.before('GET /me/images', function(done) {
    request({
        method: 'GET',
        uri: appUrl + '/users/me/images',
        json: true,
        headers: {
          'Authorization': token
        }
      },
      function(error, response, body) {
        imageId = body[0]._id

        done()
      })
  })
  lab.before(function(done) {
    var requestData = {
      name: 'Test App Container',
      image: imageId,
      ports: [80]
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
        expect(body.name, 'to be', 'testappcontainer')
        appId = body._id
        done()
      })
  })
  lab.test('POST', function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/users/me/apps/' + appId + '/containers',
      headers: {
        Authorization: token
      },
      json: true,
      body: {
        region: 'eu'
      }
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.status, 'to be', 'DEPLOYING')
      containerId = body._id
      done()
    })
  })
  lab.test('Reject if too many containers', function(done) {
    var TEST_USER_ID = '559396be05974b0c00b6b282'
    request({
      method: 'PATCH',
      uri: appUrl + '/users/' + TEST_USER_ID,
      json: true,
      headers: {
        'Authorization': adminToken
      },
      body: {
        containerLimit: 1
      }
    }).spread(function (response, body) {
      expect(body.containerLimit, 'to be', 1)

      return request({
        method: 'POST',
        uri: appUrl + '/users/me/apps/' + appId + '/containers',
        headers: {
          Authorization: token
        },
        json: true,
        body: {
          region: 'eu'
        }
      })
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 400)
      done()
    })
  })
  lab.test('PATCH environments', function(done) {
    var requestData = {
      environments: [
        {
          key: 'LOGGLY_HOSTNAME',
          value: 'blackbeard.io'
        },
        {
          key: 'LOGGLY_NAME',
          value: 'blackbeard'
        },
        {
          key: 'LOGGLY_SUBDOMAIN',
          value: 'blackbeard'
        }
      ]
    }
    request({
      method: 'PATCH',
      uri: appUrl + '/users/me/apps/' + appId,
      headers: {
        Authorization: token
      },
      json: true,
      body: requestData
    }, function(error, response, body) {
      expect(body.environments, 'to satisfy', requestData.environments)
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
      expect(body.status, 'to be', 'DEPLOYING')
      expect(body.deleted, 'to be', false)
      expect(body.app, 'to be', appId)
      done()
    })
  })
  lab.test('GET logs with invalid id', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps/invalid_id/logs',
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(body.message, 'to be', 'Application id provided is invalid.')
      done()
    })
  })
  lab.test('GET logs', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps/' + appId + '/logs',
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(body, 'to equal', [{
        timestamp: '1435735743'
      }])
      done()
    })
  })
  lab.test('GET user billing', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/billing',
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(body.results.length, 'to be greater than', 1)
      expect(body.results[0].month, 'to equal', '2015-05')
      expect(Object.keys(body.monthTotals).length, 'to be greater than', 1)

      done()
    })
  })
  lab.test('GET user billing (days)', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps/' + appId + '/billing',
      headers: {
        Authorization: token
      },
      qs: {
        from: '2015-05-01',
        to: '2015-05-07'
      },
      json: true
    }, function(error, response, body) {
      expect(body.length, 'to equal', 7)

      done()
    })
  })
  lab.test('GET deleted container', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users/me/apps/' + appId + '/containers/555cb1e2fc27fe6f5f540001',
      headers: {
        Authorization: token
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)

      done()
    })
  })
  lab.test('GET containers', function(done) {
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
  lab.test('GET containers as admin', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/users',
      headers: {
        Authorization: adminToken
      },
      json: true
    }, function(error, response, body) {
      _.each(body, function(user) {
        if (user.email === 'user@blackbeard.io') {
          request({
            method: 'GET',
            uri: appUrl + '/users/' + user._id + '/apps/559396bf05974b0c00b6b284/containers',
            headers: {
              Authorization: adminToken
            },
            json: true
          }, function(error, response, body) {
            expect(body.length, 'to equal', 1)
            expect(body[0].deleted, 'to be', false)

            done()
          })
        }
      })
    })
  })
})

lab.experiment('/apps/', function () {
  var app = 'testapp'
  lab.test('GET', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/apps',
      headers: {
        'Authorization': adminToken
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body, 'to be non-empty')
      done()
    })
  })
  lab.test('GET search', function(done) {
    var querystring = '?name=' + app
    request({
      method: 'GET',
      uri: appUrl + '/apps' + querystring,
      headers: {
        'Authorization': adminToken
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body, 'to be non-empty')
      expect(body[0], 'to satisfy', { name: app })
      done()
    })
  })
  lab.test('GET search limit', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/apps',
      headers: {
        'Authorization': adminToken
      },
      qs: {
        name: app,
        limit: 1
      },
      json: true
    }, function(error, response, body) {
      expect(response.statusCode, 'to be', 200)
      expect(body.length, 'to be', 1)
      done()
    })
  })
})
