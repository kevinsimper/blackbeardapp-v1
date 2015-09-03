var Promise = require('bluebird')
var _ = require('lodash')
var User = require('../models/User')
var UserRoles = require('../models/roles/')
var App = Promise.promisifyAll(require('../models/App'))
var Billing = Promise.promisifyAll(require('../services/Billing'))
var Boom = require('boom')
var moment = require('moment')

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
      return Billing.chargeHours(user, hours)
    }))
  }).then(function(charges) {
    reply({
      status: 'ok',
      data: charges
    })
  }).catch(function (err) {
    request.log([], err)
    reply(Boom.badImplementation())
  })
}
