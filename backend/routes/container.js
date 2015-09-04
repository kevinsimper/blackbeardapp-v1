var Promise = require('bluebird')
var User = require('../models/User')
var App = Promise.promisifyAll(require('../models/App'))
var Container = require('../models/Container')
var Boom = require('boom')
var _ = require('lodash')
var moment = require('moment')
var config = require('../config')
var ClusterService = require('../services/Cluster')
var Queue = require('../services/Queue')

exports.postContainers = function(request, reply) {
  var appId = request.params.app
  var user = User.getUserIdFromRequest(request)
  var region = request.payload.region

  var app = App.findById(appId)
  var container = app.then(function(app) {
    if(!app) {
      throw new Promise.OperationalError('could not find app')
    }
    return new Container({
      region: region,
      status: Container.status.UP,
      app: app,
      createdAt: Math.round(Date.now() / 1000)
    }).save()
  })
  var savingApp = Promise.all([app, container]).spread(function (app, container) {
    app.containers.push(container)
    return app.save()
  })

  var sendToWorker = Promise.all([container, savingApp]).spread(function(container, savingApp) {
    return Queue.send('container-start', {
      containerId: container._id,
      region: region
    })
  })

  Promise.all([container, savingApp, sendToWorker])
  .spread(function (container, savedApp, savedDetails) {
    reply(container)
  }).error(function (err) {
    request.log(['mongo'], err.message)
    return reply(Boom.notFound())
  }).catch( function (err) {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation('There was a problem with the database'))
  })
}

exports.getContainers = function(request, reply) {
  var app = request.params.app
  var role = request.auth.credentials.role

  var app = App.findById(app)

  var containers = app.then(function (app) {
    if(!app) {
      throw new Promise.OperationalError('Did not found')
    }
    // if there are no containers, return an empty array
    if(app.containers.length === 0) {
      return []
    }

    return Container
      .findByIdsAndRole(app.containers, role)
      .populate('cluster')
  })

  var containerObjects = containers.then(function (containers) {
    return Promise.all(containers.map(function (container) {
      return container.toObject({
        depopulate: true
      })
    }))
  })

  containerObjects.then(function (containers) {
    reply(containers)
  }).error(function (err) {
    request.log(['mongo'], err.message)
    return reply(Boom.notFound())
  }).catch( function (err) {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation())
  })
}

exports.deleteContainer = function(request, reply) {
  var containerId = request.params.container
  var role = request.auth.credentials.role

  Container.findOneByRole(containerId, role).then(function (container) {
    return Promise.fromNode(function (callback) {
      container.delete(callback)
    })
  }).spread(function (container) {
    return Queue.send('container-kill', {
      containerId: container.containerHash
    })
  }).then(function (result) {
    reply({
      message: 'Container successfully removed.'
    })
  })
  .error(function (err) {
    request.log(['mongo'], err.message)
    return reply(Boom.notFound())
  })
  .catch(function(err) {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation())
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

    Container.findOneByRole(container, role, function(err, container) {
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
