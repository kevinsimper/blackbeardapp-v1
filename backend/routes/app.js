var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var _ = require('lodash')
var User = require('../models/User')
var App = require('../models/App')
var Boom = require('boom')

var config = require('../config')

// /app
exports.getApps = function(request, reply) {
  user = request.auth.credentials
  App.find({
    user: user._id
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
// /app
exports.putApp = function(request, reply) {
  var name = request.payload.name
  var appId = request.payload.appId

  var updateCallback = function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  }

  // Verify user has ownership of app
  var user = request.auth.credentials
  App.find({
    _id: ObjectID(appId),
    user: user
  }, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    if (result.length > 0) {
      var app = result[0]
      app.name = name;
      app.save(updateCallback)
    } else {
      return reply(Boom.notFound('Could not find App'))  
    }
  })
}

exports.deleteApp = function(request, reply) {
  var appId = request.payload.appId

  var rmCallback = function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      status: 'App successfully removed.',
      appId: result._id
    })
  }

  // Verify user has ownership of app
  var user = request.auth.credentials
  App.find({
    _id: ObjectID(appId),
    user: user
  }, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    if (result.length > 0) {
      var app = result[0]
      app.remove(rmCallback)
    } else {
      return reply(Boom.notFound('Could not find App in system.'))  
    }
  })
}
