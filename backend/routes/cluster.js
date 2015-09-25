var Boom = require('boom')
var Joi = require('joi')
var Promise = require('bluebird')
var Cluster = require('../models/Cluster')
var Container = require('../models/Container')
var ClusterService = require('../services/Cluster')
var _ = require('lodash')

exports.getClusters = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function (request, reply) {
    var clusters = Cluster.find({type: {'$ne': 'test_swarm'}})

    var clusterContainers = clusters.then(function (clusters) {
      return Promise.map(clusters, function (cluster) {
        return Container.find({
          cluster: cluster._id,
          deleted: false
        })
      })
    })

    Promise.all([clusters, clusterContainers]).spread(function (clusters, clusterContainers) {
      clusters = clusters.map(function (cluster, index) {
        var used = _.sum(clusterContainers[index].map(function (container) {
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
}

exports.postCluster = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    payload: {
      type: Joi.string().required(),
      machines: Joi.number(),
      ca: Joi.string(),
      cert: Joi.string(),
      key: Joi.string(),
      ip: Joi.string(),
      sshPublic: Joi.string(),
      sshPrivate: Joi.string(),
      sshUser: Joi.string(),
      memory: Joi.number()
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
    var sshUser = request.payload.sshUser
    var memory = request.payload.memory

    new Cluster({
      type: type,
      machines: machines,
      certificates: {
        ca: ca,
        cert: cert,
        key: key,
        sshPublic: sshPublic,
        sshPrivate: sshPrivate,
        sshUser: sshUser
      },
      ip: ip,
      memory: memory
    }).saveAsync().then(function (cluster) {
      reply(cluster[0])
    }).catch(function (err) {
      reply(Boom.badImplementation())
    })
  }
}

exports.deleteCluster = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
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

      var uri = '/info'
      return ClusterService.request(cluster, uri)
    }).spread(function (response, body) {
      reply(body)
    }).error(function (err) {
      request.log(['error'], err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log(['error'], err)
      reply(Boom.badImplementation())
    })
  }
}

exports.getAllClusterUsage = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function (request, reply) {
    var clusters = Cluster.find({type: {'$ne': 'test_swarm'}})

    var clusterContainers = clusters.then(function(clusters) {
      if(!clusters || (clusters.length === 0)) {
        throw new Promise.OperationalError('no-clusters')
      }

      return _.map(clusters, function(cluster) {
        return Container.find({
          cluster: cluster._id,
          deleted: false
        })
      })
    })

    var usages = Promise.all(clusterContainers).then(function(clusterContainers) {
      return _.map(clusterContainers, function (containers) {
        var used = _.sum(containers.map(function (container) {
          return container.memory
        }))

        return {
          memoryUsed: used,
          count: containers ? containers.length : 0
        }
      })
    })

    clusters.then(function(clusters) {
      return Promise.all(usages).then(function(usages) {
        return _.map(clusters, function(cluster, i) {
          var usage = usages[i]
          return {
            cluster: cluster._id,
            memoryUsed: usage.memoryUsed,
            count: usage.count
          }
        })
      })
    }).then(function(result) {
      var memoryTotal = _.sum(_.map(result, function(cluster) {
        return cluster.memoryUsed
      }))
      var countTotal = _.sum(_.map(result, function(cluster) {
        return cluster.count
      }))
      reply({
        results: result,
        memoryUsed: memoryTotal,
        count: countTotal
      })
    }).error(function (err) {
      request.log(['error'], err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log(['error'], err)
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

      var uri = '/containers/json?all=1&size=1'
      return ClusterService.request(cluster, uri)
    }).spread(function (response, body) {
      reply(body)
    }).error(function (err) {
      request.log(['error'], err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log(['error'], err)
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

    var cluster = Cluster.findOne({_id: id}).then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('does not exist!')
      }
      return cluster
    })

    var clusterContainers = cluster.then(function (cluster) {
      return Container.find({
        cluster: cluster._id,
        deleted: false
      })
    })

    Promise.all([cluster, clusterContainers]).spread(function (cluster, clusterContainers) {
      var used = _.sum(clusterContainers.map(function (container) {
        return container.memory
      }))
      cluster = cluster.toObject()
      cluster.pressure = used / cluster.memory

      reply({
        memoryUsed: used,
        limit: cluster.memory,
        count: cluster.containers ? cluster.containers.length : 0
      })
    }).error(function (err) {
      request.log(['error'], err)
      reply(Boom.notFound())
    }).catch(function (err) {
      request.log(['error'], err)
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
      request.log(['error'], err)
      reply(Boom.badImplementation())
    })
  }
}
