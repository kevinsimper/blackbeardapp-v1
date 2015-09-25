var Promise = require('bluebird')
var Boom = require('boom')
var Joi = require('joi')
var System = Promise.promisifyAll(require('../models/System'))

exports.panic = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    payload: {
      state: Joi.boolean().required()
    }
  },
  handler: function(request, reply) {
    var id = request.auth.credentials._id

    var state = request.payload.state

    System.findOne().then(function (sys) {
      if (sys.state === state) {
        throw new Promise.OperationalError('no-change')
      }
      sys.state = state
      sys.logs.push({
        state: state,
        timestamp: Math.round(Date.now() / 1000)
      })
      return sys.save()
    }).then(function(save) {
      reply(save)
    }).error(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badRequest('No Change'))
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}
