var Promise = require('bluebird')
var _ = require('lodash')
var User = require('../models/User')
var UserRoles = require('../models/roles/')
var App = Promise.promisifyAll(require('../models/App'))
var Billing = Promise.promisifyAll(require('../services/Billing'))
var Boom = require('boom')
var moment = require('moment')
var Payment = require('../models/Payment')
var Voucher = require('../models/Voucher')
var VoucherClaimant = require('../models/VoucherClaimant')

var config = require('../config')

exports.getAllBilling = function(request, reply) {
  var user = User.getUserIdFromRequest(request)

  if (!UserRoles.isAllowed(UserRoles.ADMIN, request.auth.credentials.role)) {
    reply(Boom.unauthorized())
  }

  var today = moment()

  var users = User.find().populate('creditCards')

  var userApps = users.then(function (users) {
    return Promise.all(_.map(users, function(user) {
      return App.find({user: user}).populate('containers')
    }))
  })

  var timespans = users.then(function (users) {
    return Promise.all(_.map(users, function (user) {
      return Billing.getLastPayment(user)
    }))
  })

  var hoursToBill = Promise.all([userApps, timespans]).spread(function (userApps, timespans) {
    return Promise.all(userApps.map(function(apps, index) {
      // Loops over each of the user's apps
      return Promise.all(apps.map(function(app) {
        // For each app get usage
        return Billing.getAppBillableHours(app, moment.unix(timespans[index]), today)
      }))
    }))
  })

  Promise.all([users, hoursToBill]).spread(function(users, hoursToBill) {
    return Promise.all(users.map(function(user, i) {
      var hours = _.sum(hoursToBill[i])
      return Billing.chargeHours({user: user,
        hours: hours,
        name: "Automatic Topup"
      })
    }))
  }).then(function(charges) {
    reply({
      status: 'ok',
      data: charges
    })
  }).catch(function (err) {
    console.log(err)
    request.log(['error'], err)
    reply(Boom.badImplementation())
  })
}

var combinePayments = function (voucherClaimants, payments) {
  var combined = []
  _.each(payments, function(payment) {
    combined.push({
      user: payment.user,
      timestamp: payment.timestamp,
      amount: payment.amount,
      status: payment.status,
      source: 'Credit Card'
    })
  })
  _.each(voucherClaimants, function(voucherClaimant) {
    combined.push({
      user: voucherClaimant.user,
      timestamp: voucherClaimant.claimedAt,
      amount: voucherClaimant.voucher.amount,
      status: 'SUCCESS',
      source: 'Voucher '+voucherClaimant.voucher.code
    })
  })

  return _.sortBy(combined, function(n) {
    return n.timestamp;
  })
}

exports.getCreditLogs = {
  auth: 'jwt',
  handler: function(request, reply) {
    var userId = User.getUserIdFromRequest(request)
    var role = request.auth.credentials.role

    var voucherClaimants = VoucherClaimant.find({user: userId}).populate('voucher')
    var payments = Payment.findByUserAndRole(userId, role)

    Promise.all([voucherClaimants, payments]).spread(function(voucherClaimants, payments) {
      reply(combinePayments(voucherClaimants, payments))
    })
  }
}

exports.getAllCreditLogs = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function(request, reply) {
    var userId = User.getUserIdFromRequest(request)
    var role = request.auth.credentials.role

    var voucherClaimants = VoucherClaimant.find({}).populate(['voucher', 'user'])
    var payments = Payment.find().populate('user')

    Promise.all([voucherClaimants, payments]).spread(function(voucherClaimants, payments) {
      reply(combinePayments(voucherClaimants, payments))
    })
  }
}
