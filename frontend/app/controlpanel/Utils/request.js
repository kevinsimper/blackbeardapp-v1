var request = require('superagent')
var config = require('../config')

function getVerb(verb) {
  var method = verb === 'del' ? 'DELETE' : verb.toUpperCase()
  return function (uri) {
    return request(verb, config.BACKEND_HOST + uri)
      .set('Authorization', localStorage.token)
  }
}


exports.get = getVerb('get')
exports.post = getVerb('post')
exports.patch = getVerb('patch')
exports.put = getVerb('put')
exports.del = getVerb('del')
