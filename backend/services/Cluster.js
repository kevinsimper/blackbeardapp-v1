var request = require('request')
var Promise = require('bluebird')
var Cluster = require('../models/Cluster')
var httprequest = Promise.promisify(require('request'))

exports.getCluster = function() {
  return new Promise(function (resolve, reject) {
    Cluster.find().then(function(clusters) {
      resolve(clusters[0])
    })
  })
}

exports.request = function (cluster, uri, method, json) {
  var _uri = 'https://' + cluster.ip + ':3376' + uri
  var options = {
    uri: _uri,
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

/**
* @params {Object} cluster
* @returns {String} container id
*/
exports.createContainer = function (cluster) {
  var self = this
  var uri = '/containers/create'
  return self.request(cluster, uri, 'POST', {
    Image: 'nginx',
    ExposedPorts: {
     '80/tcp': {}
    },
    HostConfig: {
      'PublishAllPorts': true
    }
  }).spread(function (response, body) {
    return body.Id
  })
}

/**
* @params {String} container id
*/
exports.startContainer = function (cluster, containerId) {
  var uri = '/containers/' + containerId + '/start'
  return this.request(cluster, uri, 'POST')
    .spread(function (response, body) {
      return 'ok'
    })
}
