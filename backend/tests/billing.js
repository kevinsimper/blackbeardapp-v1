var Lab = require('lab')
var lab = exports.lab = Lab.script()
var expect = require('unexpected')
var Billing = require('../services/Billing')
var App = require('../models/App')
var Container = require('../models/Container')
var moment = require('moment')
var _ = require('lodash')
var Promise = require('bluebird')
var User = Promise.promisifyAll(require('../models/User'))
var request = Promise.promisify(require('request'))

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../startdev')()

lab.experiment('Testing Billing service', function() {
  var adminToken = ''
  lab.before(function (done) {
    request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: {
        email: 'admin@blackbeard.io',
        password: 'password'
      }
    }).spread(function (response, body) {
      adminToken = body.token
      done()
    })
  })
  lab.test('Verify date ranges', function(done) {

    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({createdAt: moment('2015-07-24 18:31:12').unix(), deletedAt: '2015-08-24 18:01:12'}), // 571h
      new Container({createdAt: moment('2015-07-24 18:01:12').unix(), deletedAt: '2015-10-24 18:31:12'}), // 744h
      new Container({createdAt: moment('2015-01-24 18:31:12').unix(), deletedAt: '2015-01-24 18:31:12'}), // 0h
      new Container({createdAt: moment('2015-08-06 18:31:12').unix(), deletedAt: '2015-10-24 18:31:12'}), // 606h
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppBillableHours(test, start, end).then(function(hours) {
      var total = 0
      expect(Math.ceil(moment('2015-08-24 18:01:12').diff('2015-08-01 00:00', 'minute')/60.0), 'to be', 571)
      total += 571
      expect(Math.ceil(moment('2015-09-01 00:00:00').diff('2015-08-01 00:00', 'minute')/60.0), 'to be', 744)
      total += 744
      // Skipping old app
      expect(Math.ceil(moment('2015-09-01 00:00').diff('2015-08-06 18:31:12', 'minute')/60.0), 'to be', 606)
      total += 606
      expect(hours, 'to be', 1921)

      expect(total, 'to be', 1921)

      done()
    })
  })
  lab.test('Verify single day', function(done) {
    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({createdAt: moment('2015-08-06 18:00:00').unix(), deletedAt: '2015-08-06 18:40:00'})
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppBillableHours(test, start, end).then(function(hours) {
      // TODO: Fix this test
      // expect(hours, 'to be', 1)

      done()
    })
  })
    var users = []

  lab.test('Test billing', function(done) {
    users[0] = request({
      method: 'GET',
      uri: appUrl + '/users',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function (response, body) {
      return _.filter(body, function(user) {
        return user.email == "user@blackbeard.io"
      })
    })

    // STOP the fixture container
    var stopContainer = users[0].then(function(users) {
      return request({
        method: 'DELETE',
        uri: appUrl + '/users/559396be05974b0c00b6b282/apps/559396bf05974b0c00b6b284/containers/555cb1e2fc27fe6f5f540001',
        headers: {
          Authorization: adminToken
        },
        json: true
      })
    })      

    var billing = stopContainer.then(function (users) {
      return request({
        method: 'GET',
        uri: appUrl + '/billing',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      })
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      // Need to confirm charging was attempted
      expect(body.data, 'to contain', 'did charge')

      return body.data
    })

    // Billing for 1 hour occurs here randomly so stopped the container
    var billing2 = billing.then(function () {
      return request({
        method: 'GET',
        uri: appUrl + '/billing',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      })
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      // Need to confirm no charge was made here
      expect(body.data, 'to contain', 'did not charge')

      return body.data
    })

    users[1] = billing2.then(function() {
      return request({
        method: 'GET',
        uri: appUrl + '/users',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      })
    }).spread(function (response, body) {
      return _.filter(body, function(user) {
        return user.email == "user@blackbeard.io"
      })
    })

    var newContainers = []
    newContainers[0] = users[1].then(function () {
      return request({
        method: 'POST',
        uri: appUrl + '/users/559396be05974b0c00b6b282/apps/559396bf05974b0c00b6b284/containers',
        json: true,
        headers: {
          'Authorization': adminToken
        },
        body: {
          region: 'eu'
        }
      })
    }).spread(function (response, body) {
      return body
    })

    newContainers[1] = newContainers[0].then(function () {
      return request({
        method: 'POST',
        uri: appUrl + '/users/559396be05974b0c00b6b282/apps/559396bf05974b0c00b6b284/containers',
        json: true,
        headers: {
          'Authorization': adminToken
        },
        body: {
          region: 'eu'
        }
      })
    }).spread(function (response, body) {
      return body
    })

    newContainers[2] = newContainers[1].then(function () {
      return request({
        method: 'POST',
        uri: appUrl + '/users/559396be05974b0c00b6b282/apps/559396bf05974b0c00b6b284/containers',
        json: true,
        headers: {
          'Authorization': adminToken
        },
        body: {
          region: 'eu'
        }
      })
    }).spread(function (response, body) {
      return body
    })

    newContainers[2].then(function() {done()})
  })
  lab.test('Test billing', function(done) {
    setTimeout(function() {done()}, 1000)
  })
  lab.test('Test billing', function(done) {
    var billing3 = request({
      method: 'GET',
      uri: appUrl + '/billing',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      // Need to confirm charging was attempted
      //expect(body.data, 'to contain', 'did charge')

      return body.data
    })

    users[2] = billing3.then(function() {
      return request({
        method: 'GET',
        uri: appUrl + '/users',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      })
    }).spread(function (response, body) {
      return _.filter(body, function(user) {
        return user.email == "user@blackbeard.io"
      })
    })

    Promise.all([users[0], users[1], users[2], billing3]).spread(function(userBefore, userMid, userAfter) {
      expect(userBefore[0].virtualCredit, 'to be greater than', 0)
      expect(userBefore[0].credit, 'to be greater than', 0)
      expect(userMid[0].virtualCredit, 'to be greater than', 0)
      expect(userMid[0].credit, 'to be greater than', 0)
      expect(userAfter[0].virtualCredit, 'to be greater than', 0)
      expect(userAfter[0].credit, 'to be greater than', 0)

      done()
    })
  })
})
