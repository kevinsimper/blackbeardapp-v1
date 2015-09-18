var request = require('request')
var Promise = require('bluebird')
var Cluster = require('../models/Cluster')
var Container = require('../models/Container')
var httprequest = Promise.promisify(require('request'))
var _ = require('lodash')

exports.getCluster = function() {
  return new Promise(function (resolve) {
    var clusters = Cluster.find({type: {'$ne': 'test_swarm'}})

    var clusterContainers = clusters.then(function (clusters) {
      return Promise.map(clusters, function (cluster) {
        return Container.find({
          cluster: cluster._id,
          deleted: false
        })
      })
    })
    var pressures = Promise.all([clusters, clusterContainers]).spread(function (clusters, clusterContainers) {
      return clusters.map(function (cluster, index) {
        var totalUsedMemory = _.sum(clusterContainers[index].map(function (container) {
          return container.memory
        }))
        console.log(totalUsedMemory, cluster.memory)
        return totalUsedMemory / cluster.memory
      })
    })

    Promise.all([clusters, pressures]).spread(function (clusters, pressures) {
      clusters.map(function (cluster, index) {
        console.log(pressures[index])
      })
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
  return httprequest(options).spread(function (response, body) {
    if(response.statusCode > 300) {
      throw new Error(body)
    }
    return [response, body]
  })
}

/**
* @params {Object} cluster
* @returns {String} container id
*/
exports.createContainer = function (cluster, image) {
  var self = this
  var uri = '/containers/create'
  return self.request(cluster, uri, 'POST', {
    Image: image,
    HostConfig: {
      'PublishAllPorts': true,
      // 'Memory': 1024 * 1024 * 512 // 1024 bytes * 1024 bytes = 1 megabyte * 512
    },
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

exports.lookupContainer = function (cluster, containerId) {
  var uri = '/containers/' + containerId + '/json'
  return this.request(cluster, uri, 'GET')
    .spread(function (response, body) {
      return body
    })
}

/**
* @params {String} container id
*/
exports.killContainer = function (cluster, containerId) {
  var uri = '/containers/' + containerId + '/kill'
  return this.request(cluster, uri, 'POST')
    .spread(function (response, body) {
      if (response.statusCode != 204) {
        throw new Error(response.body)
      }
      return 'ok'
    })
}
