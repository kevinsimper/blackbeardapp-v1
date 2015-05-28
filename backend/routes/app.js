var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var _ = require('lodash')
var jwt = require('jsonwebtoken')
var User = require('../models/User')
var App = require('../models/App')
var Boom = require('boom')

var config = require('../config')

// /app
exports.getApps = function(request, reply) {
  var token = request.query.token

  try {
    var decoded = jwt.verify(token, config.AUTH_SECRET)

  } catch (err) {
    reply(Boom.unauthorized('Invalid authentication token supplied.'))
  }

  App.find({
    user: ObjectID(decoded)
  }, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    // Should probably only return a subset of this information
    reply(result)
  })
}

// /app
exports.postApp = function(request, reply) {
  var token = request.payload.token
  var name = request.payload.name

  try {
    var decoded = jwt.verify(token, config.AUTH_SECRET)

  } catch (err) {
    reply(Boom.unauthorized('Invalid authentication token supplied.'))
  }

  var insertCallback = function(err, result) {
    if (err) {
      console.log(err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      status: 'App successfully added.',
      appId: result._id
    })
  }

  var newApp = new App({
    name: name,
    user: decoded,
    timestamp: Math.round(Date.now() / 1000)
  })
  newApp.save(insertCallback)
}