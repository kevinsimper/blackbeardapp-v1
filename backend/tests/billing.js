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
      expect(hours, 'to be', 1)

      done()
    })
  })

  lab.test('Test billing', function(done) {
    var user = request({
      method: 'GET',
      uri: appUrl + '/users',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function (response, body) {
      return _.findWhere(body, {email: 'user@blackbeard.io'})
    })

    var billing = request({
      method: 'GET',
      uri: appUrl + '/billing',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function (response, body) {
      expect(response.statusCode, 'to be', 200)
      // Need to confirm charging was attempted
      expect(body.data, 'to contain', 'did charge')
      return body.data
    })

    var userAfter = billing.then(function() {
      return request({
        method: 'GET',
        uri: appUrl + '/users',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      }).spread(function (response, body) {
        return _.findWhere(body, {email: 'user@blackbeard.io'})
      })
    })

    Promise.all([billing, user, userAfter]).spread(function(billing, user, userAfter) {
      expect(user.virtualCredit, 'to be greater than', 0)
      expect(user.credit, 'to be greater than', 0)
      expect(userAfter.virtualCredit, 'to be greater than', 0)
      expect(userAfter.credit, 'to be greater than', 0)
      expect(user.virtualCredit, 'not to equal', userAfter.virtualCredit)
      done()
    })
  })
})
