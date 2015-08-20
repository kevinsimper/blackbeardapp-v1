var Promise = require('bluebird')
var Boom = require('boom')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var stripe = require('stripe')(process.env.STRIPE_SECRET)
var _ = require('lodash')
var User = Promise.promisifyAll(require('../models/User'))
var Payment = Promise.promisifyAll(require('../models/Payment'))
var roles = require('../models/roles/')
var CreditCardService = require('../services/CreditCard')
var Billing = Promise.promisifyAll(require('../services/Billing'))

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

  // Charge this credit card
  var name = request.payload.name
  var amount = request.payload.amount

  var bills = CreditCardService.chargeCreditCard(user,
    id,
    role,
    name,
    amount,
    request.headers['cf-connecting-ip'] || request.info.remoteAddress)
  return reply(bills)
}

// /user/XX/creditcards POST
exports.postCreditCards = function (request, reply) {
  var newCreditCard = null
  var currentUser = null

  if (request.params.user !== 'me') {
    return reply(Boom.unauthorized('Can\'t access other users!'))
  }
  var id = User.getUserIdFromRequest(request)

  return reply(CreditCardService.saveCreditCard(id, request.payload))
}

// /user/XX/creditcards DELETE
exports.deleteCreditCards = function (request, reply) {
  var creditCard = CreditCard.findOne({_id: request.params.creditcard})
  var response = creditCard.then(function(card) {
    return new Promise(function(resolve, reject) {
      card.delete(function (err, result) {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    })
  }).then(function(result) {
    return {
      message: 'Credit card successfully removed.'
    }
  }).catch(function (err) {
    request.log(['mongo'], err)
    return Boom.badImplementation('There was a problem with the database')
  })

  return reply(response)
}
