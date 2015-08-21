var Promise = require('bluebird')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var User = Promise.promisifyAll(require('../models/User'))
var Payment = require('../models/Payment')
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
  chargeCreditCard: function (user, card, chargeName, chargeAmount, remoteAddr) {
    var self = this

    var userObj
    var cardObj
    var charge = null

    // findOne
    var cardObj = CreditCard.findOne(card)
    var userObj = User.findOne({_id: user})

    var newCharge = Promise.all([cardObj, userObj]).spread(function (cardObj, userObj) {
      if (!userObj || !cardObj) {
        throw new Promise.OperationalError("User or credit card not found")
      }

      return self.charge({
        amount: chargeAmount,
        currency: "usd",
        source: cardObj.token,
        description: chargeName
      })
    })

    newCharge.then(function (newCharge) {
      newCharge = false
      if (!newCharge) {
        throw new Promise.OperationalError("Charge failed")
      }

      charge = newCharge
      userObj.credit += newCharge.amount
      return userObj.save()
    }).then(function (savedUser) {
      if (!savedUser) {
        throw new Promise.OperationalError("User save failed")
      }

      // Now save a Payment entry
      var newPayment = new Payment({
        amount: charge.amount,
        creditCard: cardObj._id,
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
    }).catch(Promise.OperationalError, function (e) {
      return e
      //reply(Boom.notFound("Application could not be found."))
      //return Boom.badRequest(err.message, {
      //  rawType: err.rawType,
      //  code: err.code,
      //  param: err.param
      //})

      // Because Boom is crap the data sent with this exception is ignored so
      //return Boom.badRequest(err.message)
    }).catch(function (err) {
      var newPaymentFail = new Payment({
        amount: chargeAmount,
        creditCard: cardObj._id,
        user: userObj._id,
        timestamp: Math.round(Date.now() / 1000),
        ip: remoteAddr,
        status: Payment.status.FAIL
      })

      newPaymentFail.save()

      return {
        message: 'Payment failed.'
      }
    })
  }
}
