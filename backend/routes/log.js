var Promise = require('bluebird')
var Boom = require('boom')
var Log = Promise.promisifyAll(require('../models/Log'))

exports.getLogs = function (request, reply) {
  Log.findAsync().then(function (logs) {
    reply(logs)
  }).catch(function (err) {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation())
  })
}
