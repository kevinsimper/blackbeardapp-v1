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

  App.findByUserAndRole(user._id, user.role, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(result)
  })
}

exports.search = function(request, reply) {
  var name = request.payload.name

  App.find({
    name: name
  }, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(result)
  })
}

exports.postApp = function(request, reply) {
  var name = request.payload.name
  var image = request.payload.image

  var insertCallback = function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply(app)
  }

  var newApp = new App({
    name: name,
    image: image,
    user: request.auth.credentials,
    timestamp: Math.round(Date.now() / 1000)
  })
  newApp.save(insertCallback)
}
exports.putApp = function(request, reply) {
  var id = request.params.app

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
  var id = request.params.app

  var deleteCallback = function(err, result) {
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
    app.delete(deleteCallback)
  })
}

exports.postContainers = function(request, reply) {
  var app = request.params.app
  var user = User.getUserIdFromRequest(request)

  var container = {
    region: request.payload.region,
    status: 'Starting'
  }

  App.findById(app, function(err, result) {
    result.containers = result.containers || []
    result.containers.push(container)
    result.save(function(err, app) {
      reply(app.containers[app.containers.length - 1])
    })
  })
}

exports.getContainers = function(request, reply) {
  var app = request.params.app
  var user = User.getUserIdFromRequest(request)

  App.findById(app, function(err, result) {
    reply(result.containers)
  })
}

exports.deleteContainers = function(request, reply) {
  var app = request.params.app
  var container = request.params.container
  var user = User.getUserIdFromRequest(request)

  App.findById(app, function(err, result) {
    result.containers.id(container).remove()
    result.save(function(err) {
      reply()
    })
  })
}

exports.getContainer = function(request, reply) {
  var app = request.params.app
  var user = User.getUserIdFromRequest(request)
  var container = request.params.container

  App.findById(app, function(err, result) {
    reply(result.containers.id(container))
  })
}
