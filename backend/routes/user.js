var Promise = require('bluebird')
var passwordHash = require('password-hash')
var Boom = require('boom')
var User = require('../models/User')
var roles = require('../models/roles/')
var jwt = require('jsonwebtoken')
var crypto = require('crypto')
var _ = require('lodash')
var Mail = require('../services/Mail')
var Payment = require('../models/Payment')
var Log = require('../models/Log')
var Joi = require('joi')
var Hashids = require('hashids')

exports.getUsers = function(request, reply) {
  User.find(function(err, users) {
    if(err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    }
    reply(users)
  })
}

exports.getOneUser = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  User.findOneByRole(id, role, function(err, user) {
    if(err) {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    }
    if(!user) {
      return reply(Boom.notFound('User not found!'))
    }
    reply(user)
  })
}

exports.postUserUsername = {
  auth: 'jwt',
  validate: {
    payload: {
      username: Joi.string().required().min(3)
    }
  },
  handler: function(request, reply) {
    var id = User.getUserIdFromRequest(request)
    var role = request.auth.credentials.role
    var username = request.payload.username

    var user = User.findOneByRoleAsync(id, role)

    var existing = user.then(function(user) {
      if(user.username) {
        throw new Error('already-username')
      } else {
        return User.findOneAsync({ username: username })
      }
    })
    .then(function(existing) {
      if(existing) {
        throw new Error('username-taken')
      } else {
        return false
      }
    })

    Promise.all([user, existing]).spread(function(user) {
      user.username = username
      user.save(function() {
        reply({
          message: 'Username saved!'
        })
      })
    })
    .catch(function(err) {
      request.log(['error'], err)
      if(err.message === 'already-username') {
        reply(Boom.badRequest('You already have a username'))
      } else if (err.message === 'username-taken') {
        reply(Boom.conflict('Username already taken!'))
      } else {
        reply(Boom.badImplementation())
      }
    })

  }
}

exports.postUser = function(request, reply) {
  var email = request.payload.email
  var password = request.payload.password
  var hashedPassword = passwordHash.generate(password)

  var insertCallback = function(err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      message: 'User successfully added.',
      userId: result._id
    })
  }

  var resultCallback = function(err, user) {
    if (err) {
      request.log(['mongo'], err)
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
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        role: roles.USER // Regular user account
      })
      newUser.save(insertCallback)
    }
  }

  User.findOne({
    email: email
  }, resultCallback)
}

exports.putMe = {
  auth: 'jwt',
  validate: {
    payload: {
      email: Joi.string().email().required(),
      name: Joi.string().min(3).required()
    }
  },
  handler: function(request, reply) {
    var id = request.auth.credentials._id

    User.findById(id, function(err, user) {
      if(err) {
        request.log(['mongo'], err)
        reply(Boom.badImplementation())
      }
      user.email = request.payload.email
      user.name = request.payload.name
      user.save(function(err, updated) {
        if (err) {
          request.log(['mongo'], err)
          return reply(Boom.badImplementation('There was a problem with the database'))
        }
        reply(updated)
      })
    })
  }
}

exports.putUsers = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    payload: {
      email: Joi.string().email(),
      name: Joi.string(),
      role: Joi.string(),
      credit: Joi.number()
    }
  },
  handler: function(request, reply) {
    var id = User.getUserIdFromRequest(request)
    User.findById(id, function(err, user) {
      if(err) {
        request.log(['mongo'], err)
        reply(Boom.badImplementation())
      }
      user.email = request.payload.email
      user.name = request.payload.name
      user.role = request.payload.role
      user.save(function(err, updated) {
        if (err) {
          request.log(['mongo'], err)
          return reply(Boom.badImplementation('There was a problem with the database'))
        }
        reply(updated)
      })
    })
  }
}


exports.delUsers = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  User.findById(id, function(err, user) {
    if(err) {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    }
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
    if(err) {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    }
    if (user) {
      if (passwordHash.verify(password, user.password)) {
        var token = jwt.sign(user._id, process.env.AUTH_SECRET, {
          expiresInMinutes: 1440 // 24h
        });

        var log = new Log({
          user: user,
          timestamp: Math.round(Date.now() / 1000),
          ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
          type: Log.types.LOGIN,
        })
        log.saveAsync()

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

exports.postRegistrylogin = function(request, reply) {
  var username = request.payload.username
  var password = request.payload.password

  User.findOne({ username: username }).then(function (user) {
    if (!user) {
      return reply(Boom.badRequest())
    }

    if (passwordHash.verify(password, user.password)) {
      reply('ok')

      var log = new Log({
        user: user,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        type: 'Registry Login',
      })
      log.saveAsync()

    } else {
      reply(Boom.badRequest())
    }
  }).catch(function () {
    request.log(['mongo'], err)
    reply(Boom.badImplementation())
  })
}

exports.getUserPayments = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role

  if ((role !== roles.ADMIN) && (id !== 'me') && (id !== request.auth.credentials._id)) {
    return reply(Boom.unauthorized('You are not authorized to view other user\'s payments.'))
  }

  Payment.findByUserAndRole(id, role, function(err, payments) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    return reply(payments)
  })
}

exports.getUserLogs = function (request, reply) {
  var id = User.getUserIdFromRequest(request)

  var logs = Log.find({
    user: id
  }).then(function (logs) {
    reply(logs)
  }).catch(function () {
    request.log(['mongo'], err)
    return reply(Boom.badImplementation())
  })
}

exports.getVerifyUserEmail = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required()
    },
    query: {
      verify: Joi.string().regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)
    }
  },
  handler: function(request, reply) {
    var userId = User.getUserIdFromRequest(request)

    User.findOne({_id: userId})
    .then(function(user) {
      if (user === null) {
        throw new Promise.OperationalError('user-not-found')
      }

      if (user.verified) {
        throw new Promise.OperationalError('alread-verified')
      }

      var token = new Hashids("saltySALT", 64, "abcdefghijkmnpqrstuvwxyzABCDEFGHIJKMNPQRSTUVWXYZ23456789")
      user.verifyCode = token.encode([Math.floor(Date.now() / 1000), Math.floor(Math.random()*100)])

      return user.save()
    }).then(function(user) {
      return Mail.send({
        from: 'Blackbeard <info@blackbeard.io>',
        to: user.email,
        subject: 'Blackbeard - Verify Email Account',
        text: "Please click on the following link to verify your account. http://blackbeard.io/verify/" + user._id + "?verify=" + user.verifyCode +
          "\n\nRegards,\nThe team at Blackbeard"
      }, function (error, body) {
        if (error) {
          request.log(['mail'], err)
          return reply(Boom.badRequest('Error sending password reset email.'))
        }

        reply({
          message: 'Verification email successfully sent.'
        })
      })
    }).error(function (err) {
      request.log(['mongo'], err)
      if (err.cause === 'user-not-found') {
        return reply(Boom.notFound("User account could not be found."))
      } else if (err.cause === 'alread-verified') {
        return reply(Boom.badRequest("User account is already verified."))
      }
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}
