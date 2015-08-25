var Boom = require('boom')
var Joi = require('joi')
var moment = require('moment')
var Hashids = require('hashids')
var Promise = require('bluebird')
var User = Promise.promisifyAll(require('../models/User'))
var Voucher = Promise.promisifyAll(require('../models/Voucher'))
var Log = Promise.promisifyAll(require('../models/Log'))

var config = require('../config')

exports.generateVoucher = {
  auth: 'jwt',
  validate: {
    payload: {
      email: Joi.string().email(),
      amount: Joi.number(),
      note: Joi.string()
    }
  },
  app: {
    level: 'ADMIN'
  },
  handler: function(request, reply) {
    var amount = request.payload.amount
    var email = request.payload.email
    var note = request.payload.note

    var lastVoucher = Voucher.findOne().sort('-codePlain')

    return lastVoucher.then(function(lastVoucher) {
      var currentCount = 0
      if (lastVoucher) {
        currentCount = lastVoucher.codePlain+1
      }  

      var hashids = new Hashids("saltySALT", 8, "ABCDEFGHIJKMNPQRSTUVWXYZ23456789");
      var code = hashids.encode(currentCount);

      var voucher = new Voucher({
        codePlain: currentCount,
        code: code,
        email: email,
        note: note,
        amount: amount,
        createdAt: moment().unix()
      })

      return voucher.save()
    }).then(function(voucher) {
      reply({
        code: voucher.code
      })
    }).catch(function(err) {
      request.log(err)
      reply(Boom.badImplementation())
    })
  }
}


exports.getVouchers = function(request, reply) {
  var vouchers = Voucher.find()
  vouchers.then(function (vouchers) {
    reply(vouchers)
  }).catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })
}

exports.verifyVoucher = function(request, reply) {
  var code = request.params.voucher

  var voucher = Voucher.findOne({code: code.toUpperCase()})
  voucher.then(function (voucher) {
    reply({
      status: (voucher) ? 'OK' : 'Voucher could not be found.'
    })
  }).catch(function(err) {
    request.log(err)
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
    var voucher = Voucher.findOne({code: code.toUpperCase()})

    var userObj

    return Promise.all([user, voucher]).spread(function (user, voucher) {
      userObj = user

      if (voucher.status == Voucher.status.CLAIMED) {
        // Voucher has been claimed
        throw new Promise.OperationalError("Voucher already used")
      }

      // Use voucher
      voucher.status = Voucher.status.CLAIMED
      voucher.user = userId

      return voucher.save()
    }).then(function(voucher) {
      userObj.credit += voucher.amount

      return userObj.save()
    }).then(function(user) {
      var log = new Log({
        user: userId,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        type: Log.types.VOUCHER_CLAIM
      })
      return log.save()
    }).then(function(log) {
      return reply({
        status: 'OK'
      })
    }).error(function (err) {
      request.log(err)
      reply({
        status: 'FAIL',
        error: err
      })
    }).catch(function(err) {
      request.log(err)
      reply(Boom.badImplementation())
    })
  }
}