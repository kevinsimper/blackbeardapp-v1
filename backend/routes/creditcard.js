var Promise = require('bluebird')
var Boom = require('boom')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var stripe = require('stripe')(process.env.STRIPE_SECRET)
var _ = require('lodash')
var User = Promise.promisifyAll(require('../models/User'))
var Payment = Promise.promisifyAll(require('../models/Payment'))
var roles = require('../models/roles/')
var CreditCardService = require('../services/CreditCard')

exports.getCreditCards = function (request, reply) {
  var role = request.auth.credentials.role
  var userId = User.getUserIdFromRequest(request)

  User.findOneByRole(userId, role)
  .then(function(user) {
      return CreditCard.findByIdsAndRole(user.creditCards, role)
  })
  .then(function(creditCards) {
    return reply(creditCards)
  })
  .catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })
}

exports.getCreditCard = function (request, reply) {
  var user = User.getUserIdFromRequest(request)
  var id = request.params.creditcard
  var role = request.auth.credentials.role

  CreditCard.findOneByRole(id, role).then(function(card) {
    return reply(card)
  }).catch(function(CastError, e) {
    reply(Boom.notFound())
  }).catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })
}

exports.postCreditCardActivate = function (request, reply) {
  var userId = User.getUserIdFromRequest(request)
  var id = request.params.creditcard
  var role = request.auth.credentials.role

  var findCreditCards = User.findOne({_id: userId}).then(function (user) {
    var foundCard = _.find(user.creditCards, function (card) {
      return card == id
    })

    if (!foundCard) {
      reply(Boom.notFound('The specified credit card could not be found.'))
    } else {
      return CreditCard.findByIdsAndRole(user.creditCards, role)
    }
  })

  var savingCreditCards = findCreditCards.then(function (creditCards) {
    return _.map(creditCards, function (creditCard) {
      return new Promise(function (resolve, reject) {
        creditCard.active = (creditCard.id == id)
        creditCard.save(function (err, value) {
          if (err) {
            reject(err)
          } else {
            resolve(value)
          }
        })
      })
    })
  })

  Promise.all(savingCreditCards).then(function (a) {
    reply({
      message: 'Credit card set to active.',
    })
  }).catch(function (err) {
    request.log(err)
    return reply(Boom.badImplementation('There was a problem with the database.'))
  })
}

exports.postCreditCardPayment = function (request, reply) {
  var user = User.getUserIdFromRequest(request)
  var id = request.params.creditcard
  var role = request.auth.credentials.role
  var charge = null

  CreditCard.findOneByRole(id, role, function (err, creditCard) {
    if (err) {
      return reply(Boom.notFound('The specified credit card could not be found.'))
    }

    // Charge this credit card
    var name = request.payload.name
    var amount = request.payload.amount

    var paymentSaveCallback = function (err, payment) {
      if (err) {
        request.log(['mongo'], err)
        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      return reply({
        message: 'Payment successfully made.',
        paymentId: payment._id
      })
    }

    var userSaveCallback = function (err, user) {
      if (err) {
        request.log(['mongo'], err)
        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      // Now save a Payment entry
      var newPayment = new Payment({
        amount: charge.amount,
        creditCard: creditCard._id,
        chargeId: charge.id,
        user: user._id,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
        status: Payment.status.SUCCESS
      })

      newPayment.save(paymentSaveCallback)
    }

    // Increase users credit
    User.findOne({_id: user}, function (err, user) {
      if (err) {
        request.log(['mongo'], err)
        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      CreditCardService.charge({
        amount: amount,
        currency: "usd",
        source: creditCard.token,
        description: name
      }).then(function (newCharge) {
        charge = newCharge
        user.credit += newCharge.amount
        user.save(userSaveCallback)
      }).catch(function (err) {
        var newPaymentFail = new Payment({
          amount: amount,
          creditCard: creditCard._id,
          user: user._id,
          timestamp: Math.round(Date.now() / 1000),
          ip: request.headers['cf-connecting-ip'] || request.info.remoteAddress,
          status: Payment.status.FAIL
        })

        newPaymentFail.save()

        if (_.has(err, 'code')) {
          //return reply(Boom.badRequest(err.message, {
          //  rawType: err.rawType,
          //  code: err.code,
          //  param: err.param
          //}))

          // Because Boom is crap the data sent with this exception is ignored so
          return reply(Boom.badRequest(err.message))
        } else {
          request.log(['mongo'], err)
          return reply(Boom.badImplementation('There was a problem with the database.'))
        }
      })
    })
  })
}

// /user/XX/creditcards POST
exports.postCreditCards = function (request, reply) {
  if (request.params.user !== 'me') {
    return reply(Boom.unauthorized('Can\'t access other users!'))
  }

  var userId = User.getUserIdFromRequest(request)

  var card = {
    name: request.payload.name,
    creditcard: request.payload.creditcard,
    expiryMonth: request.payload.expiryMonth,
    expiryYear: request.payload.expiryYear,
    cvv: request.payload.cvv
  }

  return reply(CreditCardService.save(userId, card))
}

// /user/XX/creditcards DELETE
exports.deleteCreditCards = function (request, reply) {
  var id = User.getUserIdFromRequest(request)

  var creditCardId = request.params.creditcard

  var deleteCallback = function (err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      message: 'Creditcard successfully removed.'
    })
  }

  CreditCard.findById(creditCardId, function (err, card) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    card.delete(deleteCallback)
  })
}
