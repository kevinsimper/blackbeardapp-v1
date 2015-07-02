var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var Boom = require('boom')
var config = require('../config')
var User = require('../models/User')
var jwt = require('jsonwebtoken');

var crypto = require('crypto');
var Mail = require('../services/Mail');

// /user
exports.postUser = function(request, reply) {
  var email = request.payload.email
  var password = request.payload.password
  var hashedPassword = passwordHash.generate(password)

  var insertCallback = function(err, result) {
    if (err) {
      console.log(err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      status: 'User successfully added.',
      userId: result._id
    })
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
        credit: 0,
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
          status: 'Login successful.',
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

// /forgot
exports.postForgot = function(request, reply) {
  // This will take an email, match it up with a user account and send a password reset link
  var email = request.payload.email

  var updateCallback = function(err, user) {
     if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    // Email to user
    var data = {
      from: 'Blackbeard <info@blackbeard.io>',
      to: user.email,
      subject: 'Blackbeard - Passsoword Reset',
      text: "Please click on the following link to reset your passsword. http://blackbeard.io/forgot/"+user.resetToken+
        "\n\nRegards,\nThe team at Blackbeard"
    }

    Mail.send(data, function (error, body) {
      if (error) {
        return reply(Boom.badRequest('Could invite user.'))
      }

      reply({
        status: 'Reset password link successfully sent.'
      })
    })
  }

  User.findOne({ email: email }, function(err, user) {
    if (user) {
      crypto.randomBytes(20, function(err, buf) {
        if (err) {
          return reply(Boom.badRequest('Error generating forgot password link.'))
        }

        user.resetToken = buf.toString('hex');
        user.resetExpiry = Math.round(Date.now() / 1000) + 60*60*24 // Expiry in one day.

        user.save(updateCallback)
      });
    } else {
      reply(Boom.notFound('A user account with this email address does not exists.'))
    }
  })
}

// /forgot GET
exports.getForgotResent = function(request, reply) {
  // This will receive the token 
  var token = request.payload.token

  // will find user from this and reset password
  // return success or fail

}
