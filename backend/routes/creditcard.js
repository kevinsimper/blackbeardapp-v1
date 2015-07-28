var Boom = require('boom')
var CreditCard = require('../models/CreditCard')
var stripe = require('stripe')(process.env.STRIPE_SECRET);
var _ = require('lodash')
var Promise = require('bluebird')
var User = require('../models/User')
var Payment = require('../models/Payment')
var paymentStatus = require('../models/paymentStatus/')
var roles = require('../models/roles/')

exports.getCreditCards = function(request, reply) {
  var role = request.auth.credentials.role
  var userId = User.getUserIdFromRequest(request)

  if ((role !== roles.ADMIN) && (request.auth.credentials._id !== userId)) {
    return reply(Boom.unauthorized('You are not authorized to view other user\'s credit cards.'))
  }

  User.findOneByRole(role, userId, function(err, user) {
    return reply(user.creditCards)
  })
}

exports.getCreditCard = function(request, reply) {
  var user = User.getUserIdFromRequest(request)
  var id = request.params.creditcard
  var role = request.auth.credentials.role

  CreditCard.findOneByRole(role, id, function (err, card) {
    if (err) {
      return reply(Boom.notFound('The specified credit card could not be found.'))
    }

    if ((role !== roles.ADMIN) && (user !== 'me')) {
      User.isUsersCard(role, user, card, function (err, result) {
        if (err) {
          return reply(Boom.badImplementation('There was a problem with the database.'))
        }

        if (!result) {
          return reply(Boom.unauthorized('You are not authorized to view the specified credit card.'))
        }

        return reply(card)
      })
    } else {
      return reply(card)
    }
  })
}

exports.postCreditCardPayment = function(request, reply) {
  var user = User.getUserIdFromRequest(request)
  var id = request.params.creditcard
  var role = request.auth.credentials.role
  var charge = null

  CreditCard.findOneByRole(role, id, function (err, creditCard) {
    if (err) {
      return reply(Boom.notFound('The specified credit card could not be found.'))
    }

    // Charge this credit card
    var name = request.payload.name
    var amount = request.payload.amount

    var paymentSaveCallback = function(err, payment) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      return reply({
        message: 'Payment successfully made.',
        paymentId: payment._id
      })
    }

    var userSaveCallback = function(err, user) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      // Now save a Payment entry
      var newPayment = new Payment({
        amount: charge.amount,
        creditcard: creditCard._id,
        chargeId: charge.id,
        user: user._id,
        timestamp: Math.round(Date.now() / 1000),
        ip: request.info.remoteAddress,
        status: paymentStatus.SUCCESS
      })

      newPayment.save(paymentSaveCallback)
    }

    // Increase users credit
    User.findOne({_id: user}, function (err, user) {
      if (err) {
        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      stripe.charges.create({
        amount: amount,
        currency: "usd",
        source: creditCard.token,
        description: name
      }, function(err, newCharge) {
        if (err) {
          var newPaymentFail = new Payment({
            amount: amount,
            creditcard: creditCard._id,
            user: user._id,
            timestamp: Math.round(Date.now() / 1000),
            ip: request.info.remoteAddress,
            status: paymentStatus.FAIL
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
            return reply(Boom.badImplementation('There was a problem with the database.'))
          }
        }

        charge = newCharge
        user.credit += newCharge.amount

        user.save(userSaveCallback)
      });
    })
  })
}

// /user/XX/creditcards POST
exports.postCreditCards = function(request, reply) {
  var newCreditCard = null
  var currentUser = null

  if(request.params.user !== 'me') {
    return reply(Boom.unauthorized('Can\'t access other users!'))
  }
  var id = User.getUserIdFromRequest(request)

  var creditcard = {
    name: request.payload.name,
    creditcard: request.payload.creditcard,
    expiryMonth: request.payload.expiryMonth,
    expiryYear: request.payload.expiryYear,
    cvv: request.payload.cvv
  }

  var updateCallback = function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }
    reply({
      name: newCreditCard.name,
      number: newCreditCard.number,
      brand: newCreditCard.brand
    })
  }

  var newCardCallback = function (err, creditCard) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    currentUser.creditCards.push(creditCard._id)

    currentUser.save(updateCallback)
  }

  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    currentUser = user

    if (!user) {
      return reply(Boom.notFound('The specified user could not be found.'))
    }

    // Validate credit card
    if (!creditcard.name || !creditcard.creditcard || !creditcard.expiryMonth || !creditcard.expiryYear || !creditcard.cvv) {
      return reply(Boom.notAcceptable('Incomplete creditcard details.'))
    }

    // Now save to StripeAPI
    stripe.tokens.create({
      card: {
        number: creditcard.creditcard,
        exp_month: creditcard.expiryMonth,
        exp_year: creditcard.expiryYear,
        cvc: creditcard.cvv
      }
    }, function(err, token) {
      if (err) {
        if ('code' in err) {
          //return reply(Boom.badRequest(err.message, {
          //  rawType: err.rawType,
          //  code: err.code,
          //  param: err.param
          //}))
          // Because Boom is crap the data sent with this exception is ignored so
          return reply(Boom.badRequest(err.message))
        }

        return reply(Boom.badImplementation('There was a problem with the database.'))
      }

      newCreditCard = new CreditCard({
        name: creditcard.name,
        token: token.id,
        number: token.card.last4,
        brand: token.card.brand
      })

      newCreditCard.save(newCardCallback)
    });
  })
}

// /user/XX/creditcards DELETE
exports.deleteCreditCards = function(request, reply) {
  var id = User.getUserIdFromRequest(request)

  var creditCardId = request.params.creditcard

  var deleteCallback = function(err, result) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }
    reply({
      message: 'Creditcard successfully removed.'
    })
  }

  CreditCard.findById(creditCardId, function(err, card) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    card.delete(deleteCallback)
  })
}
