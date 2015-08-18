var Lab = require('lab')
var lab = exports.lab = Lab.script()
var expect = require('unexpected')
var Billing = require('../services/Billing')
var App = require('../models/App')
var User = require('../models/User')
var Container = require('../models/Container')
var moment = require('moment')

lab.experiment('Testing Billing service', function() {
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
  lab.test('Get per user', function(done) {

    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({createdAt: moment('2015-07-24 18:31:12').unix(), deletedAt: '2015-08-24 18:01:12'}), // 571h
      new Container({createdAt: moment('2015-07-24 18:01:12').unix(), deletedAt: '2015-10-24 18:31:12'}), // 744h
      new Container({createdAt: moment('2015-01-24 18:31:12').unix(), deletedAt: '2015-01-24 18:31:12'}), // 0h
      new Container({createdAt: moment('2015-08-06 18:31:12').unix(), deletedAt: '2015-10-24 18:31:12'}), // 606h
    ]

    var user = new User()
    var app = new App({name: "testApp", user: user})
    var test = app.toObject()
    test.containers = containers

    Billing.getUserAppsBillableHours(user, start, end).then(function(result) {
      // This test is borked

      done()
    })
  })
})
