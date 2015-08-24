var Boom = require('boom')
var moment = require('moment')
var Hashids = require('hashids')
var Promise = require('bluebird')
var Voucher = Promise.promisifyAll(require('../models/Voucher'))

var config = require('../config')

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

exports.verifyVoucher = function(request, reply) {
	var code = request.params.voucher

	var voucher = Voucher.findOne({code: code})
  voucher.then(function (voucher) {
		reply({
			status: (voucher) ? 'OK' : 'Voucher could not be found.'
		})
  }).catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })
}