var Promise = require('bluebird')
var passwordHash = require('password-hash')
var Boom = require('boom')
var User = require('../models/User')
var Voucher = require('../models/Voucher')
var VoucherClaimant = require('../models/VoucherClaimant')
var roles = require('../models/roles/')
var jwt = require('jsonwebtoken')
var crypto = require('crypto')
var _ = require('lodash')
var moment = require('moment')
var Mail = require('../services/Mail')
var Payment = require('../models/Payment')
var Log = require('../models/Log')
var Joi = require('joi')

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

exports.postUserOnboarding = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required(),
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
    }).then(function(user) {
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
    })

    // Put $3 on new users account
    // This logic should be moved to something like VoucherService.claimVoucher(user, voucher)
    var welcomeVoucher = user.then(function(user) {
      return Voucher.findOne({code: "WELCOMETOBLACKBEARD"})
    })

    var welcomeVoucherClaimed = Promise.all([user, welcomeVoucher]).spread(function(user, welcomeVoucher) {
      var voucherClaimant = new VoucherClaimant({
        voucher: welcomeVoucher._id,
        user: user._id,
        claimedAt: moment().unix()
      })

      return voucherClaimant.save()
    })

    // Increasing user's credit, however because this is a welcome voucher we are not adding them to the voucher.claimants
    // because everyone will be there.
    var userUpdatedCredit = Promise.all([user, welcomeVoucher, welcomeVoucherClaimed]).spread(function(user, welcomeVoucher, welcomeVoucherClaimed) {
      user.credit += welcomeVoucher.amount

      return user.save()
    })

    var sendResult = Promise.all([user, userUpdatedCredit]).spread(function(user, userUpdatedCredit) {
      return Mail.sendVerificationEmail(user)
    }).then(function(sendResult) {
      if (sendResult !== Mail.result.SEND_SUCCESSFUL) {
        throw new Promise.OperationalError(sendResult)
      }

      return Mail.result.SEND_SUCCESSFUL
    }).error(function (err) {
      return err.cause
    }).catch(function (err) {
      return false
    })

    Promise.all([user, sendResult]).spread(function(user, sendResult) {
      if (sendResult !== Mail.result.SEND_SUCCESSFUL) {
        throw new Promise.OperationalError(sendResult)
      }

      reply({
        message: 'User successfully added.',
        userId: user._id
      })
    }).error(function (err) {
      request.log(['mongo'], err)
      if (err.cause === 'user-already-exists') {
        return reply(Boom.badRequest("User account already exists with this email."))
      } else if (err.cause === 'already-verified') {
        return reply(Boom.badRequest("User account already verified."))
      }
      return reply(Boom.badImplementation())
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

    var user = User.findById(id)
    user.then(function(user) {
      user.email = request.payload.email
      user.name = request.payload.name
      return user.save()
    }).then(function(user) {
      reply(user)
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}

exports.patchUser = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    params: {
      user: Joi.string().required()
    },
    payload: {
      email: Joi.string().email(),
      name: Joi.string().min(3),
      role: Joi.string(),
      containerLimit: Joi.number()
    }
  },
  handler: function(request, reply) {
    var id = User.getUserIdFromRequest(request)

    var user = User.findById(id)
    user.then(function(user) {
      if (request.payload.email) {
        user.email = request.payload.email
      }
      if (request.payload.name) {
        user.name = request.payload.name
      }
      if (request.payload.role) {
        user.role = request.payload.role
      }
      if (request.payload.containerLimit) {
        user.containerLimit = request.payload.containerLimit
      }

      return user.save()
    }).then(function(user) {
      reply(user)
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}

exports.delUser = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    params: {
      user: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var id = User.getUserIdFromRequest(request)

    var user = User.findById(id)
    user.then(function(user) {
      return Promise.fromNode(function (callback) {
        user.delete(callback)
      })
    }).then(function(user) {
      reply()
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}

exports.postLogin = {
  auth: false,
  validate: {
    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var email = request.payload.email
    var password = request.payload.password

    var user = User.findOne({ email: email, deleted: false })

    var token = user.then(function(user) {
      if (!user) {
        return Log.errors.NO_USER
      }

      if (!passwordHash.verify(password, user.password)) {
        return Log.errors.INVALID_PASS
      }

      return jwt.sign(user._id, process.env.AUTH_SECRET, {
        expiresInMinutes: 1440 // 24h
      })
    })

    Promise.all([user, token]).spread(function(user, token) {
      var error = null
      if ((token === Log.errors.NO_USER) || (token === Log.errors.INVALID_PASS)) {
        error = token
      }
      var log = new Log({
        user: user,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        type: Log.types.LOGIN_FAIL,
        data: [error]
      })
      log.save()
    })

    Promise.all([user, token]).spread(function(user, token) {
      if ((token === Log.errors.NO_USER) || (token === Log.errors.INVALID_PASS)) {
        throw new Promise.OperationalError(token)
      }

      reply({
        message: 'Login successful.',
        token: token
      })
    }).error(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.unauthorized('Invalid email and password combination.'))
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}

exports.postRegistrylogin = {
  auth: false,
  validate: {
    payload: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var username = request.payload.username
    var password = request.payload.password

    var user = User.findOne({ username: username, deleted: false })
    var result = user.then(function (user) {
      if (!user) {
        return Log.errors.NO_USER
      }

      if (passwordHash.verify(password, user.password)) {
        return true
      } else {
        return Log.errors.INVALID_PASS
      }
    })

    Promise.all([user, result]).spread(function(user, result) {
      var error = null
      if ((result === Log.errors.NO_USER) || (result === Log.errors.INVALID_PASS)) {
        error = result
      }

       var log = new Log({
         user: user,
         timestamp: Math.round(Date.now() / 1000),
         ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
         type: Log.types.REGISTRY_LOGIN,
         data: [error]
      })
      log.save()
    })

    Promise.all([user, result]).spread(function(user, result) {
      if ((result === Log.errors.NO_USER) || (result === Log.errors.INVALID_PASS)) {
        throw new Promise.OperationalError(result)
      }

      reply('ok')
    }).error(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.unauthorized('Invalid username and password combination.'))
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
   }
}

exports.getUserPayments = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required()
     }
  },
  handler: function(request, reply) {
    var id = User.getUserIdFromRequest(request)
    var role = request.auth.credentials.role

    Payment.findByUserAndRole(id, role).then(function(payments) {
      reply(payments)
    }).catch(function () {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    })
  }
}

exports.getUserLogs = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  validate: {
    params: {
      user: Joi.string().required()
    }
  },
  handler: function (request, reply) {
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
}

exports.getVerifyUserEmail = {
  auth: 'jwt',
  validate: {
    params: {
      user: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var self = this
    var userId = User.getUserIdFromRequest(request)

    User.findOne({_id: userId})
    .then(function(user) {
      return Mail.sendVerificationEmail(user)
    }).then(function(send) {
      if (send !== Mail.result.SEND_SUCCESSFUL) {
        throw new Promise.OperationalError(send)
      }

      reply({
        message: 'Verification email successfully sent.'
      })
    }).error(function (err) {
      request.log(['mongo'], err)
      if (err.cause === Mail.result.USER_NOT_FOUND) {
        return reply(Boom.notFound("User account could not be found."))
      } else if (err.cause === Mail.result.ALREADY_VERIFIED) {
        return reply(Boom.badRequest("User account is already verified."))
      }
      return reply(Boom.badImplementation())
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
      code: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var code = request.params.code

    User.findOne({verifyCode: code})
    .then(function(user) {
      if (user === null) {
        throw new Promise.OperationalError(Mail.result.USER_NOT_FOUND)
      }

      if (user.verified) {
        throw new Promise.OperationalError(Mail.result.ALREADY_VERIFIED)
      }
      if (user.verifyCode !== code) {
        throw new Error('Verify code is not correct')
      }

      user.verified = true
      user.verifyCode = ''
      return user.save()
    }).then(function(user) {
      reply({
        status: 'OK',
        message: 'Account verified.'
      })
    }).error(function (err) {
      request.log(['mongo'], err)
      if (err.cause === Mail.result.USER_NOT_FOUND) {
        return reply(Boom.notFound("User account could not be found."))
      } else if (err.cause === Mail.result.ALREADY_VERIFIED) {
        return reply(Boom.badRequest("User account is already verified."))
      }
    }).catch(function (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    })
  }
}
