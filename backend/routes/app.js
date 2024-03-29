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
      query.name = new RegExp(request.query.name, 'i')
    }
    var apps = App.find(query).sort({name: 1})
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

exports.getOneApp = {
  auth: 'jwt',
  handler: function (request, reply) {
    var user = User.getUserIdFromRequest(request)
    var appId = request.params.app

    App.findOne({_id: appId, user: user}).then(function (app) {
      reply(app)
    }).catch(function(e) {
      request.log(['error'], e)
      reply(Boom.badImplementation())
    })
  }
}

exports.postApp = {
  auth: 'jwt',
  validate: {
    payload: {
      name: Joi.string().required(),
      image: Joi.string().required(),
      ports: Joi.array().required()
    }
  },
  handler: function(request, reply) {
    var name = request.payload.name
    var image = request.payload.image
    var ports = request.payload.ports
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
        ports: ports,
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

exports.patchApp = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required(),
      app: Joi.string().required()
    },
    payload: {
      environments: Joi.array()
    }
  },
  handler: function(request, reply) {
    var user = User.getUserIdFromRequest(request)
    var appId = request.params.app
    var environments = request.payload.environments

    App.findOne({_id: appId, user: user}).then(function (app) {
      if(environments) {
        app.environments = environments
      }
      return app.save()
    }).then(function(app) {
      reply(app)
    }).catch(function(e) {
      request.log(['error'], e)
      reply(Boom.badImplementation())
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
  var apps = App.find({user: user}).populate('containers')

  apps.then(function(apps) {
    var userBilling = Billing.getUsagePerApps(apps)
    userBilling.then(function(userBilling) {
      reply(userBilling)
    })
  }).catch(function(e) {
    request.log(['mongo'], e)
    reply(Boom.badImplementation())
  })
}

exports.getUserBillingPerDay = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required(),
      app: Joi.string().required()
    },
    query: {
      from: Joi.string().regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/),
      to: Joi.string().regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    }
  },
  handler: function(request, reply) {
    // Given current time get previous months of billablehours per app
    var user = User.getUserIdFromRequest(request)
    var appId = request.params.app
    var app = App.findOne({_id: appId, user: user}).populate('containers')

    app.then(function(app) {
      var from
      var to
      if(request.query.from) {
        from = moment(request.query.from)
      } else {
        from = moment().startOf('month')
      }
      if(request.query.to) {
        to = moment(request.query.to)
      } else {
        to = moment(from).endOf('month')
      }

      var userBilling = Billing.getUsagePerAppWithDays(app, from, to)
      return userBilling.then(function(userBilling) {
        reply(userBilling)
      })
    }).catch(function(e) {
      request.log(['error'], e)
      reply(Boom.badImplementation())
    })
  }
}
