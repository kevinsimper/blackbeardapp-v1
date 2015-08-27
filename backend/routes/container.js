var Promise = require('bluebird')
var User = require('../models/User')
var App = Promise.promisifyAll(require('../models/App'))
var Container = require('../models/Container')
var Boom = require('boom')
var moment = require('moment')
var config = require('../config')
var ClusterService = require('../services/Cluster')


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

  var cluster = ClusterService.getCluster()
  var containerId = cluster.then(function (cluster) {
    return ClusterService.createContainer(cluster)
  })
  var started = Promise.all([cluster, containerId]).spread(function (cluster, containerId) {
    return ClusterService.startContainer(cluster, containerId)
  })

  Promise.all([container, savingApp, started]).spread(function (container, savedApp) {
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
