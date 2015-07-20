var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var Boom = require('boom')
var config = require('../config')
var User = require('../models/User')
var Roles = require('../models/roles/')
var jwt = require('jsonwebtoken')
var crypto = require('crypto')
var _ = require('lodash')
var Mail = require('../services/Mail')


exports.getUsers = function(request, reply) {
  User.find(function(err, users) {
    if(err) {
      return reply(Boom.badImplementation())
    }
    reply(users)
  })
}

exports.getOneUser = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  User.findOneByRole(role, id, function(err, user) {
    // Get properties of user for current logged in user role
    if(!user) {
      return reply(Boom.notFound('User not found!'))
    }
    reply(user)
  })
}

// /user
exports.postUser = function(request, reply) {
  var email = request.payload.email
  var password = request.payload.password
  var hashedPassword = passwordHash.generate(password)

  var insertCallback = function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      message: 'User successfully added.',
      userId: result._id
    })
  }

  var resultCallback = function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    if (user) {
      reply(Boom.badRequest('A user account with this email address already exists.'))
    } else {
      var newUser = new User({
        email: email,
        password: hashedPassword,
        credit: 0,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.info.remoteAddress,
        role: Roles.USER // Regular user account
      })
      newUser.save(insertCallback)
    }
  }

  User.findOne({
    email: email
  }, resultCallback)
}

exports.putUsers = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  User.findById(id, function(err, user) {
    user.email = request.payload.email
    user.name = request.payload.name
    user.save(function(err, updated) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database'))
      }
      reply(updated)
    })
  })
}

exports.delUsers = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  User.findById(id, function(err, user) {
    user.delete(function(err, savedUser) {
      reply()
    })
  })
}

// /login
exports.postLogin = function(request, reply) {
  var email = request.payload.email
  var password = request.payload.password

  User.findOne({ email: email }, function(err, user) {
    if (user) {
      if (passwordHash.verify(password, user.password)) {
        var token = jwt.sign(user._id, config.AUTH_SECRET, {
          expiresInMinutes: 1440 // 24h
        });

        reply({
          message: 'Login successful.',
          token: token
        })
      } else {
        reply(Boom.unauthorized('Invalid email and password combination.'))
      }
    } else {
      reply(Boom.unauthorized('Invalid email and password combination.'))
    }
  })
}
