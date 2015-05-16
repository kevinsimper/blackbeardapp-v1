var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var Boom = require('boom')
var config = require('../config')
var User = require('../models/User')

exports.postUser = function(request, reply) {
  var email = request.payload.email
  var password = request.payload.password
  var hashedPassword = passwordHash.generate(password)

  var insertCallback = function(err, result) {
    if (err) {
      console.log(err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply('User successfully added.')
  }

  var resultCallback = function(err, user) {
    if (err) {
      console.log(err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    if (user) {
      reply(Boom.badRequest('A user account with this email address already exists.'))
    } else {
      var newUser = new User({
        email: email,
        password: hashedPassword,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.info.remoteAddress
      })
      newUser.save(insertCallback)
    }
  }

  User.findOne({
    email: email
  }, resultCallback)
}

exports.postLogin = function(request, reply) {
  var email = request.payload.email
  var password = request.payload.password

  User.findOne({ email: email }, function(err, user) {
    if (user) {
      if (passwordHash.verify(password, user.password)) {
        reply({
          status: 'Login successful'
        })
      } else {
        reply(Boom.unauthorized('Invalid email and password combination.'))
      }
    } else {
      reply(Boom.unauthorized('Invalid email and password combination.'))
    }
  })
}