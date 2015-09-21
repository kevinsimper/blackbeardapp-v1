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
var ContainerService = require('../services/Container')
var Payment = Promise.promisifyAll(require('../models/Payment'))
var Boom = require('boom')

module.exports = {
  topUpInterval: 1000,
  diffHours: function (a, b) {
    return Math.ceil(a.diff(b)/1000/60/60)
  },
  /**
  * Takes app and date range. From this all containers are retrieved and the
  * amount of hours the containers are online are summed up.
  *
  * @param {moment} start
  * @param {moment} end
  */
  getAppBillableHours: function (app, start, end) {
    var self = this
    return new Promise(function (resolve, reject) {
      var hours = 0

      app.containers.forEach(function (container, i) {
        var current = 0
        var createdDate = moment.unix(container.createdAt)

        var deletedAt = null

        if (!ContainerService.isCurrentlyRunning(container) || (Math.abs(createdDate.diff(moment())) >= 60*1000)) {
          if (container.deletedAt) {
            deletedAt = moment(Date.parse(container.deletedAt))
          } else {
            deletedAt = moment()
          }

          if (deletedAt === null || ((deletedAt.isSame(createdDate)) || (deletedAt.isBefore(createdDate)))) {
            throw new Promise.OperationalError("Seems to be deleted and created at same exact time.")
          } else {
            if (deletedAt.isBefore(end)) {
              // Stopped before end of month
              // Stopped within month
              if (createdDate.isBefore(start)) {
                // Started before start of period
                current = self.diffHours(deletedAt, start)

              } else {
                // Started at start of period
                current = self.diffHours(deletedAt, createdDate)
              }
            } else {
              // Stopped after end of month
              if (createdDate.isBefore(start)) {
                // Created before start so full month
                current = self.diffHours(end, start)

              } else {
                // from midway through to end of month
                current = self.diffHours(end, createdDate)
              }
            }

            if (ContainerService.isCurrentlyRunning(container)) {
              // App is currently running so we shouldn't count current hour
              current -= 1
            }

            hours += current
          }
        }
      })

      resolve(hours)
    })
  },
  /**
  * Get list of billable months for supplied list of apps.
  * This could be improved by not ending at the current month but by ending
  * when the app's containers are deleted.
  */
  getBillableMonths: function(apps) {
    var self = this
    return new Promise(function (resolve, reject) {
      var firstOfMonth = moment().set({
        date: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      })

      var first = _.min(_.flatten(_.map(apps, function(app) {
        return _.map(app.containers, function(container) {
          return container.createdAt
        })
      })))

      var start = firstOfMonth
      if (first) {
        start = moment.unix(first)
        start.set({
          date: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })
      }

      if (start.isBefore(firstOfMonth)) {
        // How many months ago was this started?
        var duration = moment.duration(firstOfMonth.diff(start));

        var range = []
        var current = start.clone()
        for (var i=0; i<Math.round(duration.asMonths()+1); i++) {
          range.push(current.clone())
          current.add(1, 'month')
        }

        resolve(range)
      } else {
        resolve([firstOfMonth])
      }
    })
  },
  /**
  * Per month get apps (id and name) and the amount of hours they were run.
  */
  getBillableHoursPerApps: function (apps) {
    var self = this
    return new Promise(function (resolve, reject) {
      var monthsToGet = self.getBillableMonths(apps)

      var appsHours = Promise.all([apps, monthsToGet]).spread(function (apps, monthsToGet) {
        return Promise.all(monthsToGet.map(function(month) {
          var monthEnd = month.clone().add(1, 'month')
          return Promise.all(apps.map(function(app, index) {
            return self.getAppBillableHours(app, month, monthEnd)
          }))
        }))
      })

      Promise.all([apps, monthsToGet, appsHours]).spread(function (apps, monthsToGet, appsHours) {
        var monthTotals = {}

        var results = _.flatten(monthsToGet.map(function(month, i) {
          return apps.map(function (app, j) {
            var hours = appsHours[i][j]
            var currentMonth = month.format('YYYY-MM')
            if (monthTotals[currentMonth] === undefined) {
              monthTotals[currentMonth] = 0
            }
            monthTotals[currentMonth] += hours

            return {
              month: currentMonth,
              app: {
                _id: app._id,
                name: app.name
              },
              hours: hours
            }
          })
        }))

        resolve({
          results: results,
          monthTotals: monthTotals
        })
      })
    })
  },
  /**
  * Per day get app (id and name) and the amount of hours they were run.
  */
  getBillableHoursPerAppWithDays: function (app, from, to) {
    var self = this
    return new Promise(function (resolve, reject) {
      var current = from.clone()
      var days = []
      while (current.isBefore(to) || current.isSame(to)) {
        days.push(current.clone())

        current = current.clone().add(1, 'd')
      }

      Promise.all(days.map(function (day) {
        return new Promise(function (resolve, reject) {
          var appBillableHours = self.getAppBillableHours(app, day, day.clone().add(1, 'day'))

          appBillableHours.then(function(appBillableHours) {
            resolve({
              day: day,
              hours: appBillableHours
            })
          })
        })
      })).then(function(result) {
        return _.map(result, function(entry) {
          return {
            day: entry.day.format('YYYY-MM-DD'),
            hours: entry.hours
          }
        })
      }).then(function (result) {
        resolve(result)
      })
    })
  },
  /**
   * At this stage calculateHoursPrice is hardcoded to be 7 dollars per month divided by 30 days and 24 hours.
   */
  calculateHoursPrice: function () {
    // 7 dollars divided by a full month of hours (in cents)
    return ((7 / 30) * 24) * 100
  },
  /**
   * Get last successful payment of user.
   */
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
  /**
   * Helper function to set credit of user and return promise to save.
   */
  setCredit: function (user, credit, virtualCredit) {
    user.credit = credit
    user.virtualCredit = virtualCredit

    return user.save()
  },
  /**
   * Report payment is the saving of the Payment object after a credit card charge.
   */
  reportPayment: function(charge, creditCard, user, remoteAddr) {
    // Now save a Payment entry
    var payment = new Payment({
      amount: charge.amount,
      creditCard: creditCard._id,
      chargeId: charge.id,
      user: user._id,
      timestamp: Math.round(Date.now() / 1000),
      ip: remoteAddr,
      status: Payment.status.SUCCESS
    })

    return payment.save()
  },
  /**
   * Actually charge houres if the user requires a topup. Update virtualcredit.
   */
  chargeHours: function (options) {
    var self = this

    var user = options.user
    var hours = options.hours
    var chargeName = options.name

    if (!user) {
      throw new Promise.OperationalError("User not found")
    }

    if (!chargeName) {
      throw new Promise.OperationalError("A description must be provided for the charge")
    }

    if (user.creditCards.length === 0) {
      return Promise.resolve('no active card')
    }

    var amountUsed = self.calculateHoursPrice() * hours

    // If the user has used more than their available credit then topup
    if (amountUsed > user.credit) {
      var creditcard = _.find(user.creditCards, function (cc) {
        return cc.active === true
      })

      if (creditcard) {
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
        var remoteAddr = options.remoteAddr || '127.0.0.1'
        var balance = (user.credit - amountUsed)+(paymentCount*self.topUpInterval)

        // Charge user's credit card
        var chargeCreditCard = CreditCardService.charge({
          amount: amount,
          currency: "usd",
          customer: user.stripeToken,
          description: chargeName
        })

        // Set user's new credit
        var userUpdate = chargeCreditCard.then(function (chargeCreditCard) {
          if (!chargeCreditCard) {
            throw new Promise.OperationalError("Charge failed")
          }

          return self.setCredit(user, balance, balance)
        })

        return Promise.all([userUpdate, creditcard, chargeCreditCard]).spread(function (userUpdate, creditcard, chargeCreditCard) {
          if (!userUpdate) {
            throw new Promise.OperationalError("User save failed")
          }

          // Report payment as Payment object
          return self.reportPayment(chargeCreditCard, creditcard, userUpdate, remoteAddr)
        }).then(function (savedPayment) {
          if (!savedPayment) {
            throw new Promise.OperationalError("Payment save failed")
          }

          return 'did charge'
        }).error(function (err) {
          return 'charging error'
        }).catch(function (err) {
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
