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
    return reply(Boom.unauthorized('Invalid authentication token supplied.'))
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
// /app
exports.putApp = function(request, reply) {
  var token = request.payload.token
  var name = request.payload.name
  var appId = request.payload.appId

  try {
    var decoded = jwt.verify(token, config.AUTH_SECRET)

  } catch (err) {
    reply(Boom.unauthorized('Invalid authentication token supplied.'))
  }

  var updateCallback = function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      status: 'App successfully updated.',
      appId: result._id
    })
  }

  // Verify user has ownership of app
  App.find({
    _id: ObjectID(appId),
    user: ObjectID(decoded)
  }, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    if (result.length > 0) {
      var app = result[0]
      app.name = name;
      app.save(updateCallback)
    } else {
      return reply(Boom.notFound('Could not find App in system.'))  
    }
  })
}

exports.deleteApp = function(request, reply) {
  var token = request.payload.token
  var appId = request.payload.appId

  try {
    var decoded = jwt.verify(token, config.AUTH_SECRET)

  } catch (err) {
    reply(Boom.unauthorized('Invalid authentication token supplied.'))
  }

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
  App.find({
    _id: ObjectID(appId),
    user: ObjectID(decoded)
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


