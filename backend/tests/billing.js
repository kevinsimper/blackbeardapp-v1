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

      expect(hours, 'to be', total)
      expect(hours, 'to be', 1921)

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
  lab.test('Verify container that just started ignored', function(done) {
    var start = moment(new Date()).subtract(1, 'day')
    var end = moment(new Date()).add(1, 'month')

    var fiveMinAgo = moment(new Date()).subtract(5, 'minute').unix()
    var containers = [
      new Container({createdAt: fiveMinAgo})
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppBillableHours(test, start, end).then(function(hours) {
      expect(hours, 'to be', 0)

      done()
    })
  })
  lab.test('Verify multiple containers', function(done) {
    var start = moment(new Date()).subtract(1, 'day')
    var end = moment(new Date()).add(1, 'month')

    var oneAndHalfHoursAgo = moment(new Date()).subtract(1.5, 'hour')
    var tenHoursAgo = moment(new Date()).subtract(10, 'hour')
    var containers = [
      new Container({createdAt: oneAndHalfHoursAgo.unix()}),
      new Container({createdAt: tenHoursAgo.unix(), deletedAt: oneAndHalfHoursAgo.format("YYYY-MM-DD HH:mm:ss")})
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppBillableHours(test, start, end).then(function(hours) {
      expect(hours, 'to be', 1+9)

      done()
    })
  })
  lab.test('Test billing', function(done) {
    var users = []
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

    var billing = users[0].then(function (users) {
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

    Promise.all([users[0], users[1]]).spread(function(user, userAfter) {
      expect(user[0].virtualCredit, 'to be', 500)
      expect(user[0].credit, 'to be', 500)
      expect(userAfter[0].virtualCredit, 'not to equal', 0)
      expect(userAfter[0].credit, 'not to equal', 0)

      done()
    })
  })
  lab.test('Test getBillableTimeframe', function(done) {
    // Get start of current month and go back 3 months and 10 days
    var start = moment().set({
      date: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).subtract(3, 'month').subtract(10, 'day')

    var containers = [
      new Container({createdAt: start.unix()})
    ]
    var app = new App({name: "testApp"})
    var testApp = app.toObject()
    testApp.containers = containers

    var dates = Billing.getBillableMonths([testApp])
    // Will include:
    // 1) current month
    // 2) one month ago
    // 3) two months ago
    // 4) three months ago
    // 5) four months ago (10 days of month)
    expect(dates.length, 'to be', 5)

    done()
  })
  lab.test('Test getBillableTimeframe 2', function(done) {
    // Get start of current month and go back 13 days
    var start = moment().set({
      date: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).subtract(13, 'day')

    var containers = [
      new Container({createdAt: start.unix()})
    ]
    var app = new App({name: "testApp"})
    var testApp = app.toObject()
    testApp.containers = containers

    var dates = Billing.getBillableMonths([testApp])
    // Will include:
    // 1) current month
    // 2) one month ago (13 days of month)
    expect(dates.length, 'to be', 2)

    done()
  })
})
