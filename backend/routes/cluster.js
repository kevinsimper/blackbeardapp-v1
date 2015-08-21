var Boom = require('boom')
var Joi = require('joi')
var Cluster = require('../models/Cluster')

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
    }
  },
  handler: function (request, reply) {
    var type = request.payload.type
    var machines = request.payload.machines
    var ca = request.payload.ca
    var cert = request.payload.cert
    var key = request.payload.key

    new Cluster({
      type: type,
      machines: machines,
      certificates: {
        ca: ca,
        cert: cert,
        key: key
      }
    }).saveAsync().then(function (cluster) {
      reply(cluster)
    }).catch(function (err) {
      reply(Boom.badImplementation())
    })
  }
}
