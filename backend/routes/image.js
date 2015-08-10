var Image = require('../models/Image')
var User = require('../models/User')
var Boom = require('boom')

var config = require('../config')

exports.getImages = function(request, reply) {
  var userId = User.getUserIdFromRequest(request)

  User.findById(userId, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    Image.find({ user: userId }, function(err, result) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database'))
      }
      reply(result)
    })
  })
}

