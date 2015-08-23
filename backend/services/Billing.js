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
    return Math.ceil(a.diff(b)/1000/60/60)
  },
  /**
  * @param {moment} start
  * @param {moment} end
  */
  getAppBillableHours: function (app, start, end) {
    var self = this
    return new Promise(function (resolve, reject) {
      var hours = 0

      app.containers.forEach(function (container, i) {
        var createdDate = moment.unix(container.createdAt)

        if ((Math.abs(moment().diff(createdDate)) < 4000) &&
          (Math.abs(moment().diff(end)) < 4000)) {
          
          // Just created so set it to 1h
          hours += 1
        } else {
          var deletedAt = moment()

          if (container.deletedAt) {
            var deletedAt = moment(Date.parse(container.deletedAt))
          }

          if (!deletedAt.isBefore(start)) {
            if (deletedAt.isBefore(end)) {
              // Stopped before end of month
              // Stopped within month
              if (createdDate.isBefore(start)) {
                // Started before start of period
                hours += self.diffHours(deletedAt, start)
              } else {
                // Started at start of period
                hours += self.diffHours(deletedAt, createdDate)
              }
            } else {
              // Stopped after end of month
              if (createdDate.isBefore(start)) {
                // Created before start so full month
                hours += self.diffHours(end, start)
              } else {
                // from midway through to end of month
                hours += self.diffHours(end, createdDate)
              }
            }
          }
        }
      })

      resolve(hours)
    })
  },
  calculateHoursPrice: function () {
    // 7 dollars divided by a full month of hours (in cents)
    return ((7 / 30) * 24) * 100
  },
  getLastPayment: function (user) {
    return Payment.findOne({
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
  chargeHours: function (user, hours) {
    var self = this
      if (user.creditCards.length === 0) {
        return new Promise(function(resolve, reject) {
          return resolve('has no creditcards')
        })
      }

      var amountUsed = self.calculateHoursPrice() * hours

      if (amountUsed > user.credit) {
        var activeCard = _.find(user.creditCards, function (cc) {
          return cc.active === true
        })

        if (activeCard) {
          var amount = (amountUsed - user.credit) + 1000
          return CreditCardService.chargeCreditCard({
            user: user._id,
            card: activeCard._id,
            message: "Automatic Topup",
            amount: amount
          }).then(function (amount) {
            return 'did charge'
          }).catch(function(err) {
            return 'charging error'
          })
        } else {
          return new Promise(function(resolve, reject) {
            return resolve('no active card')
          });
        }
      } else {
        return new Promise(function(resolve, reject) {
          return resolve('did not charge')
        });
      }
  }
}
