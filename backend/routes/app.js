var Promise = require('bluebird')
var ObjectId = require('mongodb').ObjectID
var _ = require('lodash')
var User = require('../models/User')
var UserRoles = require('../models/roles/')
var App = Promise.promisifyAll(require('../models/App'))
var Image = Promise.promisifyAll(require('../models/Image'))
var Billing = Promise.promisifyAll(require('../services/Billing'))
var Container = require('../models/Container')
var Boom = require('boom')
var moment = require('moment')

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

exports.search = function(request, reply) {
  var name = request.payload.name

  App.find({
    name: name
  }, function(err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(result)
  })
}

exports.postApp = function(request, reply) {
  var name = request.payload.name
  var image = request.payload.image
  var user = User.getUserIdFromRequest(request)

  if (!name) {
    return reply(Boom.badRequest('You must supply an application name.'))
  }

  if (!image) {
    return reply(Boom.badRequest('You must supply an image to base your application on.'))
  }

  var insertCallback = function(err, app) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  }

  var newApp = new App({
    name: name,
    image: image,
    user: user,
    timestamp: Math.round(Date.now() / 1000)
  })
  newApp.save(function(err, app) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  })
}

exports.putApp = function(request, reply) {
  var id = request.params.app

  var updateCallback = function(err, app) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  }

  App.findById(id, function(err, app) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    app.name = request.payload.name;
    // Explicitly leaving out image here - I'm not entirely sure if you should be able to change this once the app is made
    app.save(updateCallback)
  })
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

exports.postContainers = function(request, reply) {
  var appId = request.params.app
  var user = User.getUserIdFromRequest(request)

  var app = App.findById(appId)
  var container = app.then(function(app) {
    if(!app) {
      throw new Promise.OperationalError('could not find app')
    }
    return new Container({
      region: request.payload.region,
      status: Container.status.UP,
      app: app,
      createdAt: Math.round(Date.now() / 1000)
    }).save()
  })
  var savingApp = Promise.all([app, container]).spread(function (app, container) {
      app.containers.push(container)
      return app.save()
  })
  Promise.all([container, savingApp]).spread(function (container, savedApp) {
    reply(container)
  }).error(function (err) {
    request.log(['mongo'], err.message)
    return reply(Boom.notFound())
  }).catch( function (err) {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation('There was a problem with the database'))
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

exports.getContainers = function(request, reply) {
  var app = request.params.app
  var role = request.auth.credentials.role

  App.findById(app, function(err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    if (result.containers.length) {
      Container.findByIdsAndRole(result.containers, role, function(err, containers) {
        if (err) {
          request.log(['mongo'], err)
          return reply(Boom.badImplementation('There was a problem with the database'))
        }

        reply(containers)
      })
    } else {
      reply([])
    }
  })
}

exports.deleteContainers = function(request, reply) {
  var app = request.params.app
  var containerId = request.params.container
  var role = request.auth.credentials.role

  var deleteCallback = function (err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    reply({
      message: 'Container successfully removed.'
    })
  }

  Container.findByIdAndRole(containerId, role, function(err, container) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    // Set container to deleted
    container.delete(deleteCallback)
  })
}

exports.getContainer = function(request, reply) {
  var app = request.params.app
  var container = request.params.container
  var role = request.auth.credentials.role

  App.findById(app, function(err, app) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    if (!app) {
      return reply(Boom.notFound('The specified app could not be found.'))
    }

    Container.findByIdAndRole(container, role, function(err, container) {
      if (err) {
        request.log(['mongo'], err)
        return reply(Boom.badImplementation('There was a problem with the database'))
      }

      if (!container) {
        return reply(Boom.notFound('The specified container could not be found.'))
      }

      reply(container)
    })
  })
}

exports.getUserBilling = function(request, reply) {
  var user = User.getUserIdFromRequest(request)

  var month = request.params.month

  if (!month.match(/\d{4}-\d{2}/g)) {
    return reply(Boom.badRequest('The month provided is not of the format YYYY-MM.'))
  }

  var monthM = moment(request.params.month, "YYYY-MM")
  var monthEndM = moment(request.params.month, "YYYY-MM").add(1, 'month')

  var billableHours = Billing.getUserAppsBillableHours(user, monthM, monthEndM)

  billableHours.then(function(billableHoursResult) {
    reply(billableHoursResult)
  }).catch(function(e) {
    request.log(['mongo'], e)
    reply(Boom.badImplementation())
  })
}
