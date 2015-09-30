var Boom = require('boom')
var Joi = require('joi')
var moment = require('moment')
var _ = require('lodash')
var Hashids = require('hashids')
var Promise = require('bluebird')
var User = Promise.promisifyAll(require('../models/User'))
var Voucher = Promise.promisifyAll(require('../models/Voucher'))
var VoucherClaimant = Promise.promisifyAll(require('../models/VoucherClaimant'))
var Log = Promise.promisifyAll(require('../models/Log'))
var Payment = Promise.promisifyAll(require('../models/Payment'))

var config = require('../config')

exports.generateVoucher = {
  auth: 'jwt',
  validate: {
    payload: {
      email: Joi.string().email(),
      amount: Joi.number(),
      note: Joi.string(),
      code: Joi.string(),
      limit: Joi.number().allow(null)
    }
  },
  app: {
    level: 'ADMIN'
  },
  handler: function(request, reply) {
    var amount = request.payload.amount
    var email = request.payload.email || null
    var note = request.payload.note || null
    var code = request.payload.code || null
    var limit = request.payload.limit

    if (limit === undefined) {
      limit = 1
    }

    var voucher = new Voucher({
      email: email,
      amount: amount,
      note: note,
      limit: limit,
      createdAt: moment().unix()
    })

    var newVoucher = voucher.save()

    var newCode = newVoucher.then(function(voucher) {
      if (code) {
        return code.toUpperCase().replace(' ', '_').replace(/[^A-Z0-9_]/gi, '');
      }

      var hashids = new Hashids("saltySALT", 8, "ABCDEFGHIJKMNPQRSTUVWXYZ23456789");
      return hashids.encode([Math.floor(Date.now() / 1000), Math.floor(Math.random()*100)]);
    })

    var existingVoucherWithCode = newCode.then(function(code) {
      return Voucher.findOne({code: code})
    })    

    var newVoucherWithCode = Promise.all([newVoucher, newCode, existingVoucherWithCode]).spread(function(newVoucher, newCode, existingVoucherWithCode) {
      // It does not clash so the code is good to go
      if (existingVoucherWithCode === null) {
        newVoucher.code = newCode

        return newVoucher.save()  
      }

      throw new Promise.OperationalError("Voucher code already taken")
    })

    return newVoucherWithCode.then(function(voucher) {
      reply(voucher)
    }).error(function (err) {
      request.log(['error'], err)
      reply(Boom.badRequest())
    }).catch(function(err) {
      request.log(['error'], err)
      reply(Boom.badImplementation())
    })
  }
}

exports.getVouchers = function(request, reply) {
  var vouchers = Voucher.find().populate('claimants')
  vouchers.then(function (vouchers) {
    reply(vouchers)
  }).catch(function(err) {
    request.log(['error'], err)
    reply(Boom.badImplementation())
  })
}

exports.getUsedVouchers = {
  auth: 'jwt',
  handler: function(request, reply) {
    var userId = User.getUserIdFromRequest(request)

    var voucherClaimants = VoucherClaimant.find({user: userId}).populate('voucher')

    voucherClaimants.then(function (voucherClaimant) {
      voucherClaimant = _.map(voucherClaimant, function(v) {
        var claimant = v.toObject()
        delete claimant.voucher.claimants
        return claimant
      })
      reply(voucherClaimant)
    }).catch(function(err) {
      request.log(['error'], err)
      reply(Boom.badImplementation())
    })
  }
}

// Please note this is anonymous and does not check if the voucher has previously
// been claimed by the user. Only checks that the code is valid
exports.verifyVoucher = function(request, reply) {
  var code = request.params.voucher

  var voucher = Voucher.findOne({code: code.toUpperCase()}).populate('claimants')
  voucher.then(function (voucher) {
    var status = 'Voucher could not be found.'
    if (voucher) {
      // Check if voucher is in unlimited mode
      // or has not been claimed too many times
      if ((voucher.limit === null) || (voucher.used < voucher.limit)) {
        status = 'OK'
      } else {
        status = 'Voucher is no longer valid'
      }
    }

    reply({
      status: status
    })
  }).catch(function(err) {
    request.log(['error'], err)
    reply(Boom.badImplementation())
  })
}

exports.claimVoucher = {
  auth: 'jwt',
  validate: {
    payload: {
      code: Joi.string()
    }
  },
  handler: function(request, reply) {
    var userId = User.getUserIdFromRequest(request)
    var code = request.payload.code

    var user = User.findById(userId)
    var voucher = Voucher.findOne({code: code.toUpperCase()}).populate('claimants')

    var voucherClaimant = Promise.all([user, voucher]).spread(function (user, voucher) {
      if (!voucher) {
        throw new Promise.OperationalError("Voucher is invalid")
      }

      if (voucher.code === "WELCOMETOBLACKBEARD") {
        throw new Promise.OperationalError("Voucher is invalid")
      }

      // Check if voucher is in unlimited mode
      // or has not been claimed too many times
      if ((voucher.limit === null) || (voucher.used < voucher.limit)) {
        // Check if voucher has not been previously claimed by user
        voucher.claimants.forEach(function(previousClaimant) {
          if (previousClaimant.user+'' == user._id) {
            throw new Promise.OperationalError("Voucher already claimed")
          }
        })

        var voucherClaimant = new VoucherClaimant({
          voucher: voucher._id,
          user: user._id,
          claimedAt: moment().unix()
        })

        return voucherClaimant.save()
      } else {
        throw new Promise.OperationalError("Voucher is invalid")
      }
    })

    var savedVoucher = Promise.all([voucher, voucherClaimant]).spread(function(voucher, voucherClaimant) {
      voucher.claimants.push(voucherClaimant)
      voucher.used += 1

      return voucher.save()
    })

    return Promise.all([user, savedVoucher]).spread(function(user, voucher) {
      user.credit += voucher.amount

      return user.save()
    }).then(function(user) {
      var log = new Log({
        user: userId,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        type: Log.types.VOUCHER_CLAIM
      })
      log.save()

      return reply({
        status: 'OK'
      })
    }).error(function (err) {
      request.log(['error'], err)
      reply({
        status: 'FAIL',
        error: err
      })
    }).catch(function(err) {
      request.log(['error'], err)
      reply(Boom.badImplementation())
    })
  }
}
