var Lab = require('lab')
var lab = exports.lab = Lab.script()
var expect = require('unexpected')
var Billing = require('../services/Billing')
var App = require('../models/App')
var Container = require('../models/Container')
var moment = require('moment')

lab.experiment('Testing Billing service', function() {
  lab.test('Verify date ranges', function(done) {

    var start = moment('2015-08', "YYYY-MM")
    var end = moment('2015-09', "YYYY-MM")

    var containers = [
      new Container({createdAt: moment('2015-07-24 18:31:12').unix(), deletedAt: '2015-08-24 18:31:12'}), // 570h
      new Container({createdAt: moment('2015-07-24 18:31:12').unix(), deletedAt: '2015-10-24 18:31:12'}), // 744h
      new Container({createdAt: moment('2015-01-24 18:31:12').unix(), deletedAt: '2015-01-24 18:31:12'}), // 0h
      new Container({createdAt: moment('2015-08-06 18:31:12').unix(), deletedAt: '2015-10-24 18:31:12'}), // 605h
    ]
    var app = new App({name: "testApp"})
    var test = app.toObject()
    test.containers = containers

    Billing.getAppBillableHours(test, start, end).then(function(hours) {
      var total = 0
      expect(moment('2015-08-24 18:31:12').diff('2015-08-01 00:00', 'hour'), 'to be', 570)
      total += 570
      expect(moment('2015-09-01 00:00:00').diff('2015-08-01 00:00', 'hour'), 'to be', 744)
      total += 744
      // Skipping old app
      expect(moment('2015-09-01 00:00').diff('2015-08-06 18:31:12', 'hour'), 'to be', 605)
      total += 605
      expect(hours, 'to be', 1919)

      expect(total, 'to be', 1919)

      done()
    })
  })
})
