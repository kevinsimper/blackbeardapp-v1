var Boom = require('boom')
var Joi = require('joi')
var Cluster = require('../models/Cluster')
var Promise = require('bluebird')
var httprequest = Promise.promisify(require('request'))

exports.getClusters = function (request, reply) {
  Cluster.find().then(function (clusters) {
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
      ip: Joi.string()
    }
  },
  handler: function (request, reply) {
    var type = request.payload.type
    var machines = request.payload.machines
    var ca = request.payload.ca
    var cert = request.payload.cert
    var key = request.payload.key
    var ip = request.payload.ip

    new Cluster({
      type: type,
      machines: machines,
      certificates: {
        ca: ca,
        cert: cert,
        key: key
      },
      ip: ip
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
      console.log(cluster)
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

var dockerapi = function (cluster, uri, method, json) {
  var options = {
    uri: uri,
    agentOptions: {
      cert: cluster.certificates.cert,
      key: cluster.certificates.key,
      ca: cluster.certificates.ca
    },
    json: true
  }
  if (json) {
    options.body = json
  }
  if (method) {
    options.method = method
  }
  return httprequest(options)
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

      var uri = 'https://' + cluster.ip + ':3376/info'
      return dockerapi(cluster, uri)
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

      var uri = 'https://' + cluster.ip + ':3376/containers/json'
      return dockerapi(cluster, uri)
    }).spread(function (response, body) {
      reply(body)
    }).error(function (err) {
      request.log(err)
      reply(Boom.notFound())
    }).catch(function (err) {
      console.log(err, err.stack)
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
    var cluster = Cluster.findOne({_id: id})

    var createContainer = cluster.then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('does not exist!')
      }

      var uri = 'https://' + cluster.ip + ':3376/containers/create'
      request.log('creating container')
      return dockerapi(cluster, uri, 'POST', {
        Image: 'nginx',
        ExposedPorts: {
         '80/tcp': {}
        },
        HostConfig: {
          'PublishAllPorts': true
        }
      })
    })

    Promise.all([cluster, createContainer]).spread(function (cluster, container) {
      var uri = 'https://' + cluster.ip + ':3376/containers/' + container[1].Id + '/start'
      request.log('start container ' + container[1].Id)
      return dockerapi(cluster, uri, 'POST')
    }).spread(function (response, body) {
      reply(body)
    }).error(function (err) {
      request.log(err)
      reply(Boom.notFound())
    }).catch(function (err) {
      console.log(err, err.stack)
      request.log(err)
      reply(Boom.badImplementation())
    })
  }
}
