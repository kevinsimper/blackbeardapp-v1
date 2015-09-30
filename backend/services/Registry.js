var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var _ = require('lodash')

exports.getAllImages = function (registryUrl) {
  var url = registryUrl + '/v2/_catalog'
  return request({
    method: 'GET',
    uri: url,
    json: true
  }).spread(function(response, body) {
    return body.repositories
  })
}

exports.getOneImage = function (registryUrl, image) {
  var url = registryUrl + '/v2/' + image + '/tags/list'
  return request({
    method: 'GET',
    uri: url,
    json: true
  }).spread(function (response, body) {
    return body
  })
}

exports.getOneTagImageManifest = function (registryUrl, image, tag) {
  var url = registryUrl + '/v2/' + image + '/manifests/' + tag
  return request({
    method: 'GET',
    uri: url,
    json: true
  }).spread(function (response, body) {
    body.dockerContentDigest = response.headers['docker-content-digest']
    body.history = body.history.map(function (history) {
      history.v1Compatibility = JSON.parse(history.v1Compatibility)
      return history
    })
    return body
  })
}

exports.extractPortsFromTagImageManifest = function(manifest) {
  if (!manifest.length) {
    return []
  }
  // Overcomplicated code here but it has to extract a very nested value with the key 'ExposedPorts'
  var imageManifest = manifest[0]
  return _.uniq(_.flatten(_.without(_.map(imageManifest.history, function(history) {
    if (history.v1Compatibility.config.ExposedPorts) {
      return _.map(Object.keys(history.v1Compatibility.config.ExposedPorts), function (port) {
        return port.split("/")[0]
      })
    }
  }), undefined)))
}
