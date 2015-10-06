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

var adminToken = ''
lab.experiment('Testing Billing service', function() {
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

  lab.test('Less than 1 hour within range', function(done) {
    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({
        createdAt: moment('2015-08-06 18:00:00').unix(),
        deletedAt: '2015-08-06 18:40:00',
        deleted: true
      })
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppUsage(test, start, end).then(function(hours) {
      expect(hours, 'to be', 1)

      return Billing.getAppBilling(test, start, end)
    }).then(function (hours) {
      expect(hours, 'to be', 1)

      done()
    })
  })
  lab.test('More than 2 hours within range', function(done) {
    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({
        createdAt: moment('2015-08-06 18:00:00').unix(),
        deletedAt: '2015-08-06 20:40:00',
        deleted: true
      })
    ]
    var app = new App({name: "testApp"}).toObject()
    app.containers = containers

    Billing.getAppUsage(app, start, end).then(function(hours) {
      expect(hours, 'to be', 3)

      return Billing.getAppBilling(app, start, end)
    }).then(function (hours) {
      expect(hours, 'to be', 3)

      done()
    })
  })
  lab.test('Single day multiple containers within range', function(done) {
    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({
        createdAt: moment('2015-08-06 18:00:00').unix(),
        deletedAt: '2015-08-06 20:40:00',
        deleted: true
      }),
      new Container({
        createdAt: moment('2015-08-06 18:00:00').unix(),
        deletedAt: '2015-08-06 20:40:00',
        deleted: true
      })
    ]
    var app = new App({name: "testApp"}).toObject()
    app.containers = containers

    Billing.getAppUsage(app, start, end).then(function(hours) {
      expect(hours, 'to be', 6) // 2 3-hour blocks

      return Billing.getAppBilling(app, start, end)
    }).then(function (hours) {
      expect(hours, 'to be', 6) // 2 3-hour blocks

      done()
    })
  })
  lab.test('Multiple days multiple containers within range', function(done) {
    var start = moment('2015-08-01')
    var end = moment('2015-09-01')

    var containers = [
      new Container({
        createdAt: moment('2015-08-06 18:00:00').unix(),
        deletedAt: '2015-08-06 20:40:00',
        deleted: true
      }),
      new Container({
        createdAt: moment('2015-08-05 18:00:00').unix(),
        deletedAt: '2015-08-06 20:40:00',
        deleted: true
      })
    ]
    var app = new App({name: "testApp"}).toObject()
    app.containers = containers

    Billing.getAppUsage(app, start, end).then(function(hours) {
      expect(hours, 'to be', 3 + (24 + 3))

      return Billing.getAppBilling(app, start, end)
    }).then(function (hours) {
      expect(hours, 'to be', 3 + (24 + 3))

      done()
    })
  })

  lab.test('1 month 1 container within range', function(done) {
    var start = moment('2015-07-01')
    var end = moment('2015-09-01')

    var app = new App({name: "testApp"}).toObject()
    app.containers = [
      new Container({
        createdAt: moment('2015-07-24 18:00:00').unix(),
        deletedAt: '2015-08-24 18:00:00',
        deleted: true
      }), // 571h
    ]

    var total = Math.ceil(moment('2015-08-24 18:00:00').diff('2015-07-24 18:00:00', 'hours', true))
    expect(total, 'to be', 744)

    Billing.getAppUsage(app, start, end).then(function(hours) {
      expect(hours, 'to be', total)

      return Billing.getAppBilling(app, start, end)
    }).then(function (hours) {
      expect(hours, 'to be', 744)

      done()
    })
  })

  lab.test('1 month 1 container out of range', function(done) {
    var app = new App({name: "testApp"}).toObject()
    app.containers = [
      new Container({
        createdAt: moment('2015-07-24 18:00:00').unix(),
        deletedAt: '2015-08-24 18:00:00',
        deleted: true
      }), // 571h
    ]

    var start = moment('2015-08-01')
    var end = moment('2015-08-02')
    Billing.getAppUsage(app, start, end).then(function(hours) {
      expect(hours, 'to be', 24)
      done()
    })
  })
  lab.test('Verify container that just started', function(done) {
    var start = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).subtract(1, 'day')
    var end = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).add(1, 'day')

    var fiveMinAgo = moment().subtract(5, 'minute').unix()
    var containers = [
      new Container({
        createdAt: fiveMinAgo,
        deleted: false
      })
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppUsage(test, start, end).then(function(hours) {
      expect(hours, 'to be', 1)

      return Billing.getAppBilling(test, start, end)
    }).then(function (hours) {
      expect(hours, 'to be', 0)

      done()
    })
  })
  lab.test('Verify multiple containers', function(done) {
    var start = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).subtract(1, 'day')
    var end = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }).add(1, 'month')

    var oneAndHalfHoursAgo = moment().subtract(1.5, 'hour')
    var tenHoursAgo = moment().subtract(10, 'hour')

    var containers = [
      new Container({
        createdAt: oneAndHalfHoursAgo.unix()
      }),
      new Container({
        createdAt: tenHoursAgo.unix(),
        deletedAt: oneAndHalfHoursAgo.format("YYYY-MM-DD HH:mm:ss"),
        deleted: true
      })
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppUsage(test, start, end).then(function(hours) {
      expect(hours, 'to be', 2 + 9)

      return Billing.getAppBilling(test, start, end)
    }).then(function (hours) {
      // One and a half hours ago an app was started but has not been deleted yet,
      // therefore it is only been running one hour for billing purposes.
      expect(hours, 'to be', 1 + 9)

      done()
    })
  })
})

lab.experiment('Testing Billing API', function() {
  lab.test('/billing', function(done) {
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

    users[1] = billing.then(function() {
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
})

lab.experiment('Test getBillableMonths', function() {
  lab.test('Test getBillableMonths', function(done) {
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
    dates.then(function(dates) {
      // Will include:
      // 1) current month
      // 2) one month ago
      // 3) two months ago
      // 4) three months ago
      // 5) four months ago (10 days of month)
      expect(dates.length, 'to be', 5)

      done()
    })
  })
  lab.test('Test getBillableMonths 2', function(done) {
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
    dates.then(function(dates) {
      // Will include:
      // 1) current month
      // 2) one month ago (13 days of month)
      expect(dates.length, 'to be', 2)

      done()
    })
  })
})
