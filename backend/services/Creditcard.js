var Promise = require('bluebird')

exports.charge = function (options) {
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
        amount: options.amount
      })
    }
  })
}

exports.create = function (options) {
  return new Promise(function (resolve, reject) {
    if(process.env.NODE_ENV === 'production') {
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
}
