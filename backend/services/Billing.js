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
var Payment = Promise.promisifyAll(require('../models/Payment'))
var Boom = require('boom')

module.exports = {
  topUpInterval: 1000,

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
  chargeCreditCard: function (options) {
    var self = this

    var userId = options.user
    var cardId = options.card
    var chargeName = options.message
    var chargeAmount = options.amount
    var remoteAddr = options.remoteAddr || '127.0.0.1'
    var balance = options.balance

    var creditcard = CreditCard.findOne({_id: cardId})
    var user = User.findOne({_id: userId})

    var chargeCreditCard = Promise.all([creditcard, user]).spread(function (creditcard, user) {
      if (!user) {
        throw new Promise.OperationalError("User not found")
      }

      if (!creditcard) {
        throw new Promise.OperationalError("Credit card not found")
      }

      return CreditCardService.charge({
        amount: chargeAmount,
        currency: "usd",
        source: creditcard.token,
        description: chargeName
      })
    })

    var userUpdate = Promise.all([user, chargeCreditCard]).spread(function (user, chargeCreditCard) {
      if (!chargeCreditCard) {
        throw new Promise.OperationalError("Charge failed")
      }

      user.credit = balance
      user.virtualCredit = balance

      return user.save()
    })

    return Promise.all([userUpdate, creditcard, chargeCreditCard]).spread(function (userUpdate, creditcard, chargeCreditCard) {
      if (!userUpdate) {
        throw new Promise.OperationalError("User save failed")
      }

      // Now save a Payment entry
      var newPayment = new Payment({
        amount: chargeCreditCard.amount,
        creditCard: creditcard._id,
        chargeId: chargeCreditCard.id,
        user: userUpdate._id,
        timestamp: Math.round(Date.now() / 1000),
        ip: remoteAddr,
        status: Payment.status.SUCCESS
      })

      return newPayment.save()
    }).then(function (savedPayment) {
      if (!savedPayment) {
        throw new Promise.OperationalError("Payment save failed")
      }

      return {
        message: 'Payment successfully made.',
        paymentId: savedPayment._id
      }
    }).error(function (err) {
      return err
    }).catch(function (err) {
      console.log(err)
      return new Error('Payment failed')
    })
  },
  chargeHours: function (user, hours) {
    var self = this

    if (user.creditCards.length === 0) {
      return Promise.resolve('has no creditcards')
    }

    var amountUsed = self.calculateHoursPrice() * hours

    if (amountUsed > user.credit) {
      var activeCard = _.find(user.creditCards, function (cc) {
        return cc.active === true
      })

      if (activeCard) {
        // This code dictates how much the user is charged.
        // A note has been placed on the wiki about it here:
        // https://github.com/kevinsimper/blackbeardapp/wiki/Charging-Users
        var leftover = user.credit - amountUsed
        var paymentCount = 0
        while (leftover < 0) {
          leftover += self.topUpInterval

          paymentCount++
        }

        var amount = paymentCount*self.topUpInterval

        return self.chargeCreditCard({
          user: user._id,
          card: activeCard._id,
          message: "Automatic Topup",
          amount: amount,
          balance: (user.credit - amountUsed)+(paymentCount*self.topUpInterval)
        }).then(function (result) {
          if (result && result.paymentId) {
            return 'did charge'

          } else {
            return 'charging error'
          }
        }).catch(function(err) {
          return 'charging error'
        })
      } else {
        return 'no active card'
      }
    } else {
      // Set virtualcredit
      user.virtualCredit = user.credit - amountUsed

      return user.saveAsync().spread(function(user) {
        return 'did not charge'
      })
    }
  }
}
