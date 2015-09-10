var Promise = require('bluebird')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var User = Promise.promisifyAll(require('../models/User'))
var Payment = Promise.promisifyAll(require('../models/Payment'))

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
      return Promise.reject('The specified user could not be found.')
    }
    if (!creditcard.name || !creditcard.creditcard || !creditcard.expiryMonth || !creditcard.expiryYear || !creditcard.cvv) {
      return Promise.reject('Incomplete creditcard details.')
    }
    var creditcard = {
      name: card.name,
      creditcard: card.creditcard,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv
    }

    var user = User.findById(userId).then(function (user) {
      if(!user) {
        return Promise.OperationalError('No user found!')
      }
      return user
    })

    var stripeToken = user.then(function() {
      return self.create({
        card: {
          number: creditcard.creditcard,
          exp_month: creditcard.expiryMonth,
          exp_year: creditcard.expiryYear,
          cvc: creditcard.cvv
        }
      })
    })
    var newCreditcard = Promise.all([stripeToken, user]).spread(function(stripeToken, user) {
      return new CreditCard({
        name: creditcard.name,
        token: stripeToken.id,
        number: stripeToken.card.last4,
        brand: stripeToken.card.brand,
        active: (user.creditCards.length === 0)
      }).save()
    })

    var savedUser = Promise.all([user, newCreditcard]).spread(function(user, creditCard) {
      user.creditCards.push(creditCard._id)
      return user.save()
    })

    return Promise.all([savedUser, newCreditcard]).spread(function(creditCard, newCreditcard) {
      return {
        name: newCreditcard.name,
        number: newCreditcard.number,
        brand: newCreditcard.brand
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

    var creditcard = CreditCard.findOne({_id: cardId}).then(function(creditcard) {
      if (!creditcard) {
        throw new Promise.OperationalError("Credit card not found")
      }
      return creditcard
    })
    var user = User.findOne({_id: userId}).then(function (user) {
      if (!user) {
        throw new Promise.OperationalError("User not found")
      }
      return user
    })

    var newCharge = creditcard.then(function(creditcard) {
      return self.charge({
        amount: chargeAmount,
        currency: "usd",
        source: creditcard.token,
        description: chargeName
      })
    })

    var savedUser = Promise.all([newCharge, user]).spread(function (newCharge, user) {
      user.credit = balance
      user.virtualCredit = balance
      return user.save()
    })

    var savedNewPayment = Promise.all([savedUser, creditcard, newCharge])
      .spread(function (savedUser, creditcard, newCharge) {
        return new Payment({
          amount: newCharge.amount,
          creditCard: creditcard._id,
          chargeId: newCharge.id,
          user: savedUser._id,
          timestamp: Math.round(Date.now() / 1000),
          ip: remoteAddr,
          status: Payment.status.SUCCESS
        }).save()
      })

    return savedNewPayment.then(function (savedPayment) {
      return {
        message: 'Payment successfully made.',
        paymentId: savedPayment._id
      }
    }).catch(function (err) {
      console.log(err.stack)
      return err
    })
  }
}
