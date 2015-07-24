var Boom = require('boom')
var User = require('../models/User')
var CreditCard = require('../models/CreditCard')
var stripe = require('stripe')(process.env.STRIPE_SECRET);
var _ = require('lodash')

exports.getCreditCards = function(request, reply) {
  var role = request.auth.credentials.role
  var userId = request.auth.credentials._id

  User.findOneByRole(role, userId, function(err, user) {
    return reply(user.creditCards)
  })
}

exports.getCreditCard = function(request, reply) {
  var user = User.getUserIdFromRequest(request)
  var id = request.params.creditcard
  var role = request.auth.credentials.role

  User.findOneByRole(role, user, function(err, user) {
    var creditCard = _.find(user.creditCards, function(card) {
      return card._id == id;
    })

    if (creditCard) {
      return reply(creditCard)
    }
    return reply(Boom.notFound('The specified credit card could not be found.'))
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

  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

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
        // Actually retrieve errors
        // TODO: Should return actual error message and error code here.
        // return reply({
        //   message: err.message,
        //   rawType: err.rawType,
        //   code: err.code,
        //   param: err.param,
        // })
        return reply(Boom.badRequest(err.message, {
          rawType: err.rawType,
          code: err.code,
          param: err.param,
        }))

        //return reply(Boom.badImplementation('There was an error saving your credit card details.'))
      }

      newCreditCard = new CreditCard({
        name: creditcard.name,
        token: token.id,
        number: token.card.last4,
        brand: token.card.brand
      })

      user.creditCards.push(newCreditCard)

      user.save(updateCallback)
    });
  })
}

// /user/XX/creditcards DELETE
exports.deleteCreditCards = function(request, reply) {
  if(request.params.user !== 'me') {
    return reply(Boom.unauthorized('Can\'t access other users!'))
  }
  var id = User.getUserIdFromRequest(request)

  var name = request.params.name

  var updateCallback = function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }
    reply({message: 'Creditcard successfully removed.'})
  }

  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    if (!user) {
      return reply(Boom.notFound('The specified user could not be found.'))
    }


    if (!user.creditCards) {
      return reply(Boom.notFound('The creditcard specified could not be found.'))
    }

    var removed = _.remove(user.creditCards, function(creditcard) {
      return creditcard.name === name;
    })
    removed.forEach(function(item) {
      item.remove()
    })

    if (removed.length === 0) {
      return reply(Boom.notFound('The creditcard specified could not be found.'))
    }

    user.save(updateCallback)
  })
}
