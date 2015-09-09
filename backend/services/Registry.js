var Promise = require('bluebird')
var request = Promise.promisify(require('request'))

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
    body.history = body.history.map(function (history) {
      history.v1Compatibility = JSON.parse(history.v1Compatibility)
      return history
    })
    return body
  })
}
