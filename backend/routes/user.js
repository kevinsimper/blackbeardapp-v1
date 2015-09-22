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

exports.getUsers = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function(request, reply) {
    var users = User.find()
    users.then(function(users) {
      reply(users)
    }).catch(function(err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}

exports.getOneUser = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var id = User.getUserIdFromRequest(request)
    var role = request.auth.credentials.role

    var user = User.findOneByRole(id, role)
    user.then(function(user) {
      if(!user) {
        return reply(Boom.notFound('User not found!'))
      }
      reply(user)
    }).catch(function(err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}

exports.postUserUsername = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required()
    },
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

exports.postUser = {
  auth: false,
  validate: {
    payload: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var email = request.payload.email
    var password = request.payload.password
    var hashedPassword = passwordHash.generate(password)

    var user = User.findOne({
      email: email
    })
    user.then(function(user) {
      if (user) {
        throw new Promise.OperationalError('user-already-exists')
      }

      var newUser = new User({
        email: email,
        password: hashedPassword,
        credit: 0,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        role: roles.USER // Regular user account
      })
      return newUser.save()
    }).then(function(user) {
      reply({
        message: 'User successfully added.',
        userId: user._id
      })
    }).error(function (err) {
      request.log(['mongo'], err)
      if (err.cause === 'user-not-found') {
        return reply(Boom.badRequest("User account already exists with this email."))
      }
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
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
        text: "Please click on the following link to verify your account. http://blackbeard.io/verify/" + user._id + "?code=" + user.verifyCode +
          "\n\nRegards,\nThe team at Blackbeard"
      }, function (error, body) {
        if (error) {
          request.log(['mail'], err)
          return reply(Boom.badRequest('Error sending password reset email.'))
        }

        reply({
          status: 'OK',
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

exports.getVerify = {
  auth: false,
  validate: {
    params: {
      user: Joi.string().required()
    },
    query: {
      code: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var userId = request.params.user

    User.findOne({_id: userId})
    .then(function(user) {
      if (user === null) {
        throw new Promise.OperationalError('user-not-found')
      }

      if (user.verified) {
        throw new Promise.OperationalError('alread-verified')
      }

      user.verified = true
      return user.save()
    }).then(function(user) {
      reply({
        status: 'OK',
        message: 'Account verified.'
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
