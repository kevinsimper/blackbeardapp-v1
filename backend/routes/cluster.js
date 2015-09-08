var Boom = require('boom')
var Joi = require('joi')
var Promise = require('bluebird')
var Cluster = require('../models/Cluster')
var Container = require('../models/Container')
var ClusterService = require('../services/Cluster')
var _ = require('lodash')

exports.getClusters = function (request, reply) {
  Cluster.find({type: {'$ne': 'test_swarm'}}).populate('containers').then(function (clusters) {
    clusters = _.map(clusters, function (cluster) {
      var used = _.sum(_.map(cluster.containers, function(container) {
        return container.memory
      }))
      cluster = cluster.toObject()
      cluster.pressure = used / cluster.memory
      return cluster
    })

    reply(clusters)
  }).catch(function () {
    reply(Boom.badImplementation())
  })
}

exports.postCluster = {
  auth: 'jwt',
  validate: {
    payload: {
      type: Joi.string(),
      machines: Joi.number(),
      ca: Joi.string(),
      cert: Joi.string(),
      key: Joi.string(),
      ip: Joi.string(),
      sshPublic: Joi.string(),
      sshPrivate: Joi.string(),
      containerLimit: Joi.number()
    }
  },
  handler: function (request, reply) {
    var type = request.payload.type
    var machines = request.payload.machines
    var ca = request.payload.ca
    var cert = request.payload.cert
    var key = request.payload.key
    var ip = request.payload.ip
    var sshPublic = request.payload.sshPublic
    var sshPrivate = request.payload.sshPrivate
    var containerLimit = request.payload.containerLimit

    new Cluster({
      type: type,
      machines: machines,
      certificates: {
        ca: ca,
        cert: cert,
        key: key,
        sshPublic: sshPublic,
        sshPrivate: sshPrivate
      },
      ip: ip,
      containerLimit: containerLimit
    }).saveAsync().then(function (cluster) {
      reply(cluster)
    }).catch(function (err) {
      reply(Boom.badImplementation())
    })
  }
}

exports.deleteCluster = {
  auth: 'jwt',
  handler: function (request, reply) {
    var id = request.params.id
    Cluster.findOne({_id: id}).then(function (cluster) {
      return Promise.fromNode(function (callback) {
        cluster.delete(callback)
      })
    }).then(function (cluster) {
      reply()
    }).catch(function (e) {
      request.log(e)
      reply(Boom.badImplementation())
    })
  }
}

exports.getClusterStatus = {
  auth: 'jwt',
  validate: {
    params: {
      cluster: Joi.string()
    }
  },
  handler: function (request, reply) {
    var id = request.params.cluster

    Cluster.findOne({_id: id}).then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('does not exist!')
      }

      var uri = '/info'
      return ClusterService.request(cluster, uri)
    }).spread(function (response, body) {
      reply(body)
    }).error(function (err) {
      request.log([], err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log([], err)
      reply(Boom.badImplementation())
    })
  }
}

exports.getClusterContainers = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    params: {
      cluster: Joi.string()
    }
  },
  handler: function (request, reply) {
    var id = request.params.cluster
    Cluster.findOne({_id: id}).then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('does not exist!')
      }

      var uri = '/containers/json'
      return ClusterService.request(cluster, uri)
    }).spread(function (response, body) {
      reply(body)
    }).error(function (err) {
      request.log(err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log(err)
      reply(Boom.badImplementation())
    })
  }
}

exports.getClusterUsage = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    params: {
      cluster: Joi.string()
    }
  },
  handler: function (request, reply) {
    var id = request.params.cluster
    Cluster.findOne({_id: id}).populate('containers').then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('does not exist!')
      }

      reply({
        memoryUsed: _.sum(_.map(cluster.containers, function(container) {
          return container.memory
        })),
        limit: cluster.memory,
        count: cluster.containers.length
      })
    }).error(function (err) {
      request.log(err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log(err)
      reply(Boom.badImplementation())
    })
  }
}

exports.getClusterStartContainer = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    params: {
      cluster: Joi.string()
    }
  },
  handler: function (request, reply) {
    var id = request.params.cluster

    var cluster = ClusterService.getCluster()
    var containerId = cluster.then(function (cluster) {
      return ClusterService.createContainer(cluster)
    })

    var startContainer = Promise.all([cluster, containerId]).spread(function (cluster, containerId) {
      return ClusterService.startContainer(cluster, containerId)
    })
    Promise.all([containerId, startContainer]).spread(function(containerId, startContainer) {
      reply(containerId)
    }).catch(function (err) {
      request.log([], err)
      reply(Boom.badImplementation())
    })
  }
}
