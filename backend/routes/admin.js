var passwordHash = require('password-hash')
var _ = require('lodash')
var Boom = require('boom')
var User = require('../models/User')
var Mail = require('../services/Mail')

var config = require('../config')

exports.inviteUser = function(request, reply) {
  var userId = request.query.userId
  var credit = request.query.credit
  if (!credit) {
    // Default credit to 1000 (10 dollars)
    credit = 1000;
  }

  var updateCallback = function(err, user) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    var data = {
        from: 'Blackbeard <info@blackbeard.io>',
        to: user.email,
        subject: 'Blackbeard Credit Applied!',
        text: "Your new account at Blackbeard has been credited for $"+credit+". To use this credit and take "+
          "advantage of the hosting services provided by Blackbeard please login at http://blackbeard.io."+
          "\n\nRegards,\nThe team at Blackbeard"
    }

    Mail.send(data, function (error, body) {
      if (error) {
        return reply(Boom.badRequest('Could invite user.'))
      }

      reply({
        status: 'Invitation successfully sent.'
      })
    })
  }

  User.findOne({ _id: userId }, function(err, user) {
    if (user) {
      var newCredit = user.credit + credit
      user.credit = newCredit
      user.save(updateCallback)
    } else {
      reply(Boom.badRequest('Could not find user account.'))
    }
  })
}

