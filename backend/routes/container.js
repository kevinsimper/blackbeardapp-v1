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

  var sendToWorker = Queue.send('container', 'start')

  var cluster = ClusterService.getCluster()
  var containerId = cluster.then(function (cluster) {
    return ClusterService.createContainer(cluster)
  })
  var started = Promise.all([cluster, containerId]).spread(function (cluster, containerId) {
    return ClusterService.startContainer(cluster, containerId)
  })

  var savedDetails = Promise.all([container, cluster, containerId, started])
    .spread(function (container, cluster, containerId, started) {
      container.cluster = cluster
      container.containerHash = containerId
      return container.save()
    })
    .catch(function (err) {
      if(process.env.NODE_ENV === 'production') {
        throw err
      } else {
        console.warn('No cluster attached', err.stack)
      }
    })

  Promise.all([container, savingApp, savedDetails, sendToWorker])
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

  var clusterContainer = containers.then(function (containers) {
    return Promise.all(containers.map(function (container) {
      if(!container.cluster) {
        throw new Promise.OperationalError('No cluster attached')
      }
      return ClusterService.lookupContainer(container.cluster, container.containerHash)
    }))
  }).then(function (containersInfo) {
    return Promise.all(containersInfo.map(function (containerInfo) {
      var ports = Object.keys(containerInfo.NetworkSettings.Ports).reverse()
      return {
        ip: containerInfo.NetworkSettings.Ports[ports[0]][0].HostIp,
        port: containerInfo.NetworkSettings.Ports[ports[0]][0].HostPort
      }
    }))
  }).error(function (err) {
    if(process.env.NODE_ENV === 'production') {
      throw err
    } else {
      console.warn(err.stack)
    }
  })

  Promise.all([containerObjects, clusterContainer]).spread(function (containers, clusterContainer) {
    reply(_.merge(containers, clusterContainer))
  }).error(function (err) {
    request.log(['mongo'], err.message)
    return reply(Boom.notFound())
  }).catch( function (err) {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation())
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

  Container.findOneByRole(containerId, role, function(err, container) {
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
