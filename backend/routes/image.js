var Image = require('../models/Image')

var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var _ = require('lodash')
var User = require('../models/User')
var Boom = require('boom')

var config = require('../config')

exports.getImages = function(request, reply) {
  var userId = User.getUserIdFromRequest(request)
  User.findById(userId, function(err, user) {
    Image.findByUserAndRole(userId, user.role, function(err, result) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database'))
      }
      reply(result)
    })
  })
}

