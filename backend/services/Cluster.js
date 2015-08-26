var request = require('request')
var Promise = require('bluebird')
var Cluster = require('../models/Cluster')
var httprequest = require('request')

exports.getCluster = function() {
  return new Promise(function (resolve, reject) {
    return Cluster.find().then(function(clusters) {
      console.log('kevin23', clusters[0])
      return clusters[0]
    })
  })
}

exports.request = function (cluster, uri, method, json) {
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
