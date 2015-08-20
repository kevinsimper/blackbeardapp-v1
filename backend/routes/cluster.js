var Boom = require('boom')
var Cluster = require('../models/Cluster')

exports.getClusters = function (request, reply) {
  Cluster.find().then(function (clusters) {
    reply(clusters)
  }).catch(function () {
    reply(Boom.badImplementation())
  })
}

exports.postCluster = function (request, reply) {
  var type = request.payload.type
  var machines = request.payload.machines

  new Cluster({
    type: type,
    machines: machines
  }).saveAsync().then(function (cluster) {
    reply(cluster)
  }).catch(function (err) {
    reply(Boom.badImplementation())
  })
}
