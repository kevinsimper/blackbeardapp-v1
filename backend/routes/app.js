var Promise = require('bluebird')
var ObjectId = require('mongodb').ObjectID
var _ = require('lodash')
var User = require('../models/User')
var UserRoles = require('../models/roles/')
var App = require('../models/App')
var Image = require('../models/Image')
var Billing = require('../services/Billing')
var Container = require('../models/Container')
var moment = require('moment')
var Boom = require('boom')
var Joi = require('joi')

var config = require('../config')

exports.getApps = function(request, reply) {
  var user = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  App.findByUserAndRole(user, role, function(err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(result)
  })
}

exports.getAllApps = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    query: {
      name: Joi.string().min(2),
      limit: Joi.number()
    }
  },
  handler: function(request, reply) {
    var query = {}
    if(request.query.name) {
      query['name'] = new RegExp(request.query.name, 'i')
    }
    var apps = App.find(query)
    if(request.query.limit) {
      apps.limit(request.query.limit)
    }
    apps.then(function(apps) {
      reply(apps)
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    })
  }
}

exports.postApp = {
  auth: 'jwt',
  validate: {
    payload: {
      name: Joi.string().required(),
      image: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var name = request.payload.name
    var image = request.payload.image
    var user = User.getUserIdFromRequest(request)

    App.findAsync({name: name}).then(function(app) {
      if (app.length) {
        throw new Promise.OperationalError('There is already an App with this name')
      }

      // Cleanse name
      name = name.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

      var newApp = new App({
        name: name,
        image: image,
        user: user,
        timestamp: Math.round(Date.now() / 1000)
      })

      return newApp.saveAsync()
    }).then(function(app) {
      reply(app[0])
    }).error(function(err) {
      request.log(['error'], err)
      reply(Boom.badRequest(err.cause))
    }).catch(function(err) {
      request.log(['error'], err)
      reply(Boom.badImplementation('There was a problem with the database'))
    })
  }
}

exports.deleteApp = function(request, reply) {
  var id = request.params.app

  var deleteCallback = function(err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      message: 'App successfully removed.'
    })
  }

  var user = User.getUserIdFromRequest(request)

  App.findById(id, function(err, app) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    app.delete(deleteCallback)
  })
}

exports.getAppLogs = function(request, reply) {
  var id = request.params.app

  try {
    ObjectId(id)
  } catch (e) {
    return reply(Boom.badRequest("Application id provided is invalid."))
  }

  var app = App.findByIdAsync(id)

  app.then(function(foundApp) {
    if (!foundApp) {
      throw new Promise.OperationalError("App not found")
    } else {
      return Image.findByIdAsync(foundApp.image)
    }
  }).then(function(image) {
    reply(image.logs)
  }).error(function (e) {
    reply(Boom.notFound("Application could not be found."))
  }).catch(function(e) {
    request.log(['mongo'], e)
    reply(Boom.badImplementation())
  })
}

exports.getUserBilling = function(request, reply) {
  // Given current time get previous months of billablehours per app
  var user = User.getUserIdFromRequest(request)
  var userBilling = Billing.getAppBillableHoursPerUser(user)
  userBilling.then(function(userBilling) {
    reply(userBilling)
  })
}
