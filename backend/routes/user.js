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
var Voucher = require('../models/Voucher')
var VoucherClaimant = require('../models/VoucherClaimant')
var Log = require('../models/Log')
var Joi = require('joi')

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

exports.postUserUsername = function(request, reply) {
  var id = User.getUserIdFromRequest(request)
  var role = request.auth.credentials.role
  var username = request.payload.username

  var user = User.findOneByRoleAsync(id, role)

  var existing = user.then(function(user) {
    if(user.username) {
      reply({
        message: 'You already have a username'
      })
    } else {
      return User.findOneAsync({ username: username })
    }
  })
  .then(function(existing) {
    if(existing) {
      reply({
        message: 'Username already taken!'
      })
      return true
    } else {
      return false
    }
  })

  Promise.all([user, existing]).spread(function(user, existing) {
    if(!existing) {
      user.username = username
      user.save(function() {
        reply({
          message: 'Username saved!'
        })
      })
    }
  })
  .catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })

}

// /user
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

exports.getCreditLogs = {
  auth: 'jwt',
  handler: function(request, reply) {
    var userId = User.getUserIdFromRequest(request)
    var role = request.auth.credentials.role

    var voucherClaimants = VoucherClaimant.find({user: userId}).populate('voucher')
    var payments = Payment.findByUserAndRole(userId, role)

    Promise.all([voucherClaimants, payments]).spread(function(voucherClaimants, payments) {
      var combined = []
      _.each(payments, function(payment) {
        combined.push({
          timestamp: payment.timestamp,
          amount: payment.amount,
          status: payment.status,
          source: 'Credit Card'
        })
      })
      _.each(voucherClaimants, function(voucherClaimant) {
        combined.push({
          timestamp: voucherClaimant.claimedAt,
          amount: voucherClaimant.voucher.amount,
          status: 'SUCCESS',
          source: 'Voucher '+voucherClaimant.voucher.code
        })
      })

      return reply(_.sortBy(combined, function(n) {
        return n.timestamp;
      }))
    })
  }
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

