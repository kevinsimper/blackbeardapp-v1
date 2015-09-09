var Promise = require('bluebird')
var request = Promise.promisify(require('request'))

exports.getAllImages = function (registryUrl) {
  var url = registryUrl + '/v2/_catalog'
  return request({
    method: 'GET',
    uri: url
  }).spread(function(response, body) {
    return body
  })
}
