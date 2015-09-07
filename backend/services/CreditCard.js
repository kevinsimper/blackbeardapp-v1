var Promise = require('bluebird')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var User = Promise.promisifyAll(require('../models/User'))
var Payment = Promise.promisifyAll(require('../models/Payment'))
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
  saveCreditCard: function (userId, card) {
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

    var user
    var userP = User.findById(userId)

    return userP.then(function(u) {
      user = u
      return self.create({
        card: {
          number: creditcard.creditcard,
          exp_month: creditcard.expiryMonth,
          exp_year: creditcard.expiryYear,
          cvc: creditcard.cvv
        }
      })
    }).then(function(token) {
      var newCreditCard = new CreditCard({
        name: creditcard.name,
        token: token.id,
        number: token.card.last4,
        brand: token.card.brand,
        active: (user.creditCards.length === 0)
      })

      return newCreditCard.save()
    }).then(function(creditCard) {
      user.creditCards.push(creditCard._id)
      return user.save()
    }).then(function(creditCard) {
      return {
        name: creditCard.name,
        number: creditCard.number,
        brand: creditCard.brand
      }
    })
  },
  chargeCreditCard: function (options) {
    var self = this

    var userId = options.user
    var cardId = options.card
    var chargeName = options.message
    var chargeAmount = options.amount
    var remoteAddr = options.remoteAddr || '127.0.0.1'
    var balance = options.balance

    var creditcard = CreditCard.findOne({_id: cardId})
    var user = User.findOne({_id: userId})

    // User _must_ exist
    return user.then(function(user) {
      if (!user) {
        throw new Promise.OperationalError("User not found")
      }

      var card
      var newCharge = creditcard.then(function(creditcard) {
        if (!creditcard) {
          throw new Promise.OperationalError("Credit card not found")
        }

        card = creditcard

        return self.charge({
          amount: chargeAmount,
          currency: "usd",
          source: creditcard.token,
          description: chargeName
        })
      })

      var charge = null
      return newCharge.then(function (newCharge) {
        if (!newCharge) {
          throw new Promise.OperationalError("Charge failed")
        }

        charge = newCharge
        user.credit = balance
        user.virtualCredit = balance

        return user.save()
      }).then(function (savedUser) {
        if (!savedUser) {
          throw new Promise.OperationalError("User save failed")
        }

        // Now save a Payment entry
        var newPayment = new Payment({
          amount: charge.amount,
          creditCard: card._id,
          chargeId: charge.id,
          user: savedUser._id,
          timestamp: Math.round(Date.now() / 1000),
          ip: remoteAddr,
          status: Payment.status.SUCCESS
        })

        return newPayment.save()
      }).then(function (savedPayment) {
        if (!savedPayment) {
          throw new Promise.OperationalError("Payment save failed")
        }

        return {
          message: 'Payment successfully made.',
          paymentId: savedPayment._id
        }
      }).error(function (err) {
        return err
      }).catch(function (err) {
        return new Error('Payment failed')
      })
    })
  }
}