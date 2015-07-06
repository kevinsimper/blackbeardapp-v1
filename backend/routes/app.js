var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var _ = require('lodash')
var User = require('../models/User')
var App = require('../models/App')
var Boom = require('boom')

var config = require('../config')

// /app
exports.getApps = function(request, reply) {
  var user = request.auth.credentials
  App.find({
    user: user._id
  }, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(result)
  })
}
exports.postApp = function(request, reply) {
  var name = request.payload.name

  var insertCallback = function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  }

  var newApp = new App({
    name: name,
    user: request.auth.credentials,
    timestamp: Math.round(Date.now() / 1000)
  })
  newApp.save(insertCallback)
}
exports.putApp = function(request, reply) {
  var id = request.params.id

  var updateCallback = function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  }

  App.findById(id, function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    app.name = request.payload.name;
    app.save(updateCallback)
  })
}

exports.deleteApp = function(request, reply) {
  var id = request.params.id

  var rmCallback = function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      message: 'App successfully removed.'
    })
  }

  var user = request.auth.credentials
  App.findById(id, function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    app.remove(rmCallback)
  })
}
