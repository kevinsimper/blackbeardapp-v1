var Promise = require('bluebird')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var User = Promise.promisifyAll(require('../models/User'))
var Boom = require('boom')

module.exports = {
  charge: function(options) {
    return new Promise(function (resolve, reject) {
      if (process.env.NODE_ENV === 'production') {
        var stripe = Promise.promisifyAll(require('stripe')(process.env.STRIPE_SECRET))
        stripe.charges.create({
          amount: amount,
          currency: "usd",
          source: creditCard.token,
          description: name
        }).then(function (newCharge) {
          resolve(newCharge)
        }).catch(function (error) {
          reject(error)
        })
      } else {
        resolve({
          amount: options.amount,
          id: 'charge_fake9999999999'
        })
      }
    })
  },
  create: function (options) {
    return new Promise(function (resolve, reject) {
      if (process.env.NODE_ENV === 'production') {
        var stripe = Promise.promisifyAll(require('stripe')(process.env.STRIPE_SECRET))
        stripe.tokens.create({
          card: {
            number: creditcard.creditcard,
            exp_month: creditcard.expiryMonth,
            exp_year: creditcard.expiryYear,
            cvc: creditcard.cvv
          }
        }).then(function (token) {
          resolve(token)
        }).catch(function (error) {
          reject(error)
        })
      } else {
        resolve({
          id: 'tok_fake9999999999',
          card: {
            last4: '1234',
            brand: 'VISA',
          }
        })
      }
    })
  },
  save: function (userId, card) {
    var self = this

    if (!userId) {
      return Boom.notFound('The specified user could not be found.')
    }

    var creditcard = {
      name: card.name,
      creditcard: card.creditcard,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv
    }

    // Validate credit card
    if (!creditcard.name || !creditcard.creditcard || !creditcard.expiryMonth || !creditcard.expiryYear || !creditcard.cvv) {
      return Boom.notAcceptable('Incomplete creditcard details.')
    }

    var user = User.findById(userId)
      .then(function(user) {
      if (!user) {
        throw new Promise.OperationalError('The specified user could not be found.')
      }

      return user
    })

    var token = self.create({
      card: {
        number: creditcard.creditcard,
        exp_month: creditcard.expiryMonth,
        exp_year: creditcard.expiryYear,
        cvc: creditcard.cvv
      }
    }).error(function (err) {
      if ('code' in err) {
        //return reply(Boom.badRequest(err.message, {
        //  rawType: err.rawType,
        //  code: err.code,
        //  param: err.param
        //}))
        // Because Boom is crap the data sent with this exception is ignored so
        return Boom.badRequest(err.message)
      }
      return Boom.badImplementation('There was a problem with the database.', err)
    }).catch(function (err) {
      return Boom.badImplementation('There was a problem with the database.', err)
    })

    var creditCard = Promise.all([user, token]).spread(function(user, token) {
      var newCreditCard = new CreditCard({
        name: creditcard.name,
        token: token.id,
        number: token.card.last4,
        brand: token.card.brand,
        active: (user.creditCards.length === 0)
      })

      return newCreditCard.save()
    })

    var userUpdate = Promise.all([user, creditCard]).spread(function(user, creditCard) {
      user.creditCards.push(creditCard._id)
      return user.save()
    })

    return Promise.all([userUpdate, creditCard]).spread(function(user, creditCard) {
      return {
        name: creditCard.name,
        number: creditCard.number,
        brand: creditCard.brand
      }
    }).catch(function (err) {
      return Boom.badImplementation('There was a problem with the database.', err)
    })
  }
}
