var User = require('../models/User')
var Mail = require('../services/Mail')
var jwt = require('jsonwebtoken')
var Boom = require('boom')
var crypto = require('crypto')
var passwordHash = require('password-hash')

exports.postForgot = function(request, reply) {
  var email = request.payload.email

  var updateCallback = function(err, user) {
     if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    // Email to user
    var data = {
      from: 'Blackbeard <info@blackbeard.io>',
      to: user.email,
      subject: 'Blackbeard - Password Reset',
      text: "Please click on the following link to reset your passsword. http://blackbeard.io/forgot/"+user.resetToken+
        "\n\nRegards,\nThe team at Blackbeard"
    }

    Mail.send(data, function (error, body) {
      if (error) {
        request.log(['mail'], err)
        return reply(Boom.badRequest('Error sending password reset email.'))
      }

      reply({
        message: 'Reset password link successfully sent.'
      })
    })
  }

  User.findOne({ email: email }, function(err, user) {
    if(err) {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    }
    if (user) {
      crypto.randomBytes(20, function(err, buf) {
        if (err) {
          return reply(Boom.badRequest('Error generating forgot password link.'))
        }

        if (process.env.NODE_ENV === 'production') {
          user.resetToken = buf.toString('hex');
        } else {
          user.resetToken = 'PredictableToken';
        }
        user.resetExpiry = Math.round(Date.now() / 1000) + 60*60*24 // Expiry in one day.

        user.save(updateCallback)
      });
    } else {
      reply(Boom.notFound('A user account with this email address does not exists.'))
    }
  })
}

// /forgot POST
exports.postForgotReset = function(request, reply) {
  var token = request.params.token
  var password = request.payload.password

  if(!password) {
    return reply(Boom.badRequest('You have to fill out a Password!'))
  }

  var updateCallback = function(err, user) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    // Automatically log user in
    var token = jwt.sign(user._id, process.env.AUTH_SECRET, {
      expiresInMinutes: 1440 // 24h
    });

    reply({
      message: 'Password successfully reset.',
      token: token
    })
  }

  User.findOne({ resetToken: token }, function(err, user) {
    if(err) {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    }
    if(!user) {
      return reply(Boom.notFound())
    }
    if (Math.round(Date.now() / 1000) > user.resetExpiry) {
      return reply(Boom.badRequest('Password reset has expired.'))
    }

    var hashedPassword = passwordHash.generate(password)

    user.password = hashedPassword
    user.resetExpiry = null;
    user.resetToken = null;

    user.save(updateCallback)
  })
}
