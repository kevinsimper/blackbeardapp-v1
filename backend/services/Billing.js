var _ = require('lodash')
var moment = require('moment')
var Promise = require('bluebird')
var App = Promise.promisifyAll(require('../models/App'))
var User = Promise.promisifyAll(require('../models/User'))
var UserRoles = require('../models/roles/')
var Container = require('../models/Container')
var Payment = Promise.promisifyAll(require('../models/Payment'))
var stripe = require('stripe')(process.env.STRIPE_SECRET)
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var CreditCardService = require('../services/CreditCard')
var Boom = require('boom')

module.exports = {
  diffHours: function (a, b) {
    return Math.ceil(a.diff(b, 'second') / 60.0 / 60.0)
  },
  getAppBillableHours: function (app, start, end) {
    var self = this
    return new Promise(function (resolve, reject) {
      var hours = 0

      app.containers.forEach(function (container, i) {
        var createdDate = moment.unix(container.createdAt)

        var deletedAt = moment().add(1, 'minute')
        if (container.deletedAt) {
          var deletedAt = moment(Date.parse(container.deletedAt))
        }

        if (!deletedAt.isBefore(start)) {
          if (deletedAt.isBefore(Date.parse(end))) {
            // Stopped within month
            if (createdDate.isBefore(start)) {
              hours += self.diffHours(deletedAt, start)
            } else {
              hours += self.diffHours(deletedAt, createdDate)
            }
          } else {
            // Stopped after end of month
            if (createdDate.isBefore(start)) {
              hours += self.diffHours(end, start)
            } else {
              hours += self.diffHours(end, createdDate)
            }
          }
        }
      })

      resolve(hours)
    })
  },
  getUserAppsBillableHours: function (user, start, end) {
    var self = this
    return new Promise(function (resolve, reject) {
      var bill = []

      var apps
      if ((user.username === 'billing_test') && (user.email === 'test@blackbeard.io')) {
        // Mocking stuff out - this could be improved
        apps = new Promise(function (resolve) {
          var app = new App({name: "testAppBilling"})
          var appObj = app.toObject()
          appObj.containers = [
            new Container({createdAt: moment('2015-07-24 18:31:12').unix(), deletedAt: '2015-08-24 18:01:12'})
          ]
          var appObj2 = app.toObject()
          appObj2.containers = [
            new Container({createdAt: moment('2015-08-28 01:31:12').unix(), deletedAt: '2015-08-29 01:01:12'})
          ]

          resolve([appObj, appObj2]);
        })
      } else {
        apps = App.find({user: user}).populate('containers')
      }

      apps.then(function (actualApps) {
        var totalHours = 0
        _.each(actualApps, function (app, i) {
          var hours = self.getAppBillableHours(app, start, end).then(function (hours) {
            if (hours) {
              bill.push({
                appName: app.name,
                appId: app._id,
                hours: hours
              })

              totalHours += hours
            }

            if (i === actualApps.length - 1) {
              resolve({apps: bill, total: totalHours})
            }
          }).catch(function (err) {
            console.log(err)
            return reply(Boom.badImplementation('There was a problem with the database.'))
          })
        })
      }).catch(function (err) {
        console.log(err)
        return reply(Boom.badImplementation('There was a problem with the database.'))
      })
    })
  },
  calculateHoursPrice: function () {
    // 7 dollars divided by a full month of hours (in cents)
    return ((7 / 30) * 24) * 100
  },
  getLastPayment: function (user) {
    Payment.findOne({
      user: user,
      status: Payment.status.SUCCESS
    }).sort({
      timestamp: -1
    }).then(function (payment) {
      if (payment) {
        return payment.timestamp
      } else {
        return user.timestamp
      }
    })
  },
  chargeHours: function (userId, hours) {
    var self = this

    var user
    return User.findById(userId).populate('creditCards').then(function(user) {
      console.log("Charge Hours Diagnostic", {
        hoursPrice: self.calculateHoursPrice(),
        credit: user.credit,
        hours: hours,
        amount:  hours*self.calculateHoursPrice()
      })

      if (self.calculateHoursPrice()*hours > user.credit) {
        var activeCard = _.find(user.creditCards, function (cc) {
          return cc.active
        })

        if (activeCard) {
          // option object
          // amount should whatever to get postive 10
          console.log("AUTOMAGIC")
          return CreditCardService.chargeCreditCard({
            user: user._id,
            card: activeCard._id,
            message: "Automatic Topup",
            amount: 1000
          })
        } else {
          return Boom.badRequest("No active credit card found for user")
        }
      } else {
        return {status: "No Charge"}
      }
    }).catch(function (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    })
  }
}
