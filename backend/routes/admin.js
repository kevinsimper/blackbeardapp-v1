var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var _ = require('lodash')
var Boom = require('boom')
var moment = require('moment')
var Hashids = require('hashids')
var User = require('../models/User')
var Promise = require('bluebird')
var Voucher = Promise.promisifyAll(require('../models/Voucher'))
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

exports.generateVoucher = function(request, reply) {
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

exports.getVouchers = function(request, reply) {
  var vouchers = Voucher.find()
  vouchers.then(function (vouchers) {
    reply(vouchers)
  }).catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })
}