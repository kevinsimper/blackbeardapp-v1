var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var _ = require('lodash')
var User = require('../models/User')
var App = require('../models/App')
var Container = require('../models/Container')

var Boom = require('boom')

var config = require('../config')

exports.getApps = function(request, reply) {
  var user = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  App.findByUserAndRole(user, role, function(err, result) {
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

  var user = User.getUserIdFromRequest(request)

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

  var container = new Container({
    region: request.payload.region,
    status: 'Starting'
  })

  App.findById(app, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    container.save(function(err, container) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database'))
      }

      result.containers.push(container)
      result.save(function(err, app) {
        reply({
          message: 'Container successfully created.',
          id: container._id
        })
      })
    })
  })
}

exports.getContainers = function(request, reply) {
  var app = request.params.app
  var user = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  App.findById(app, function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    if (result.containers.length) {
      Container.findByIds(result.containers, role, function(err, containers) {
        if (err) {
          return reply(Boom.badImplementation('There was a problem with the database'))
        }

        reply(containers)
      })
    } else {
      reply([])
    }
  })
}

exports.deleteContainers = function(request, reply) {
  var app = request.params.app
  var containerId = request.params.container
  var user = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  var deleteCallback = function (err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    App.findById(app, function(err, result) {
      result.containers = _.remove(result.containers, function(n) {
        return n === containerId
      });
      result.save(function(err) {
        reply({
          message: 'Container successfully removed.'
        })
      })
    })
  }

  Container.findByIdAndRole(containerId, role, function(err, container) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    container.remove(deleteCallback)
  })
}

exports.getContainer = function(request, reply) {
  var app = request.params.app
  var container = request.params.container
  var role = request.auth.credentials.role

  App.findById(app, function(err, app) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    if (!app) {
      return reply(Boom.notFound('The specified app could not be found.'))
    }

    Container.findByIdAndRole(container, role, function(err, container) {
      if (err) {
        console.log([container, role])
        return reply(Boom.badImplementation('There was a problem with the database'))
      }

      if (!container) {
        return reply(Boom.notFound('The specified container could not be found.'))
      }

      reply(container)
    })
  })
}
