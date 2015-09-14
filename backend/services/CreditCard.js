var Promise = require('bluebird')
var CreditCard = Promise.promisifyAll(require('../models/CreditCard'))
var User = Promise.promisifyAll(require('../models/User'))

// Show mocked responses only if you are in development environment AND you aren't currently testing stripe
var showMockedResponse = ((process.env.NODE_ENV === 'development') && !process.env.STRIPE_TEST)

module.exports = {
  charge: function(options) {
    return new Promise(function (resolve, reject) {
      if (!showMockedResponse) {
        var stripe = Promise.promisifyAll(require('stripe')(process.env.STRIPE_SECRET))
        stripe.charges.create({
          amount: options.amount,
          currency: options.currency,
          source: options.source,
          description: options.description
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
  customerCreate: function (user) {
    return new Promise(function (resolve, reject) {
      var stripe = Promise.promisifyAll(require('stripe')(process.env.STRIPE_SECRET))
      stripe.customers.create({
        description: "User "+user.email,
        email: user.email,
        metadata: {
          id: user.id
        }
      }).then(function (customer) {
        resolve(customer)
      }).catch(function (error) {
        reject(error)
      })
    })
  },
  listCards: function (user) {
    if ((process.env.NODE_ENV !== 'production') && (process.env.STRIPE_SECRET.substr(0, 8) != "sk_test_")) {
      throw new Error('Wrong Stripe API key.')
    }

    if (!user.stripeToken) {
      throw new Error('User is not associated with a Stripe account.')
    }

    return new Promise(function (resolve, reject) {
      var stripe = Promise.promisifyAll(require('stripe')(process.env.STRIPE_SECRET))
      stripe.customers.listCards(user.stripeToken).then(function (cards) {
        resolve(cards)
      }).catch(function (error) {
        reject(error)
      })
    })
  },
  create: function (customer, creditcard) {
    return new Promise(function (resolve, reject) {
      if (!showMockedResponse) {
        var stripe = Promise.promisifyAll(require('stripe')(process.env.STRIPE_SECRET))
        stripe.customers.createSource(customer, {
          source: {
            object: "card",
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
          id: 'card_6z26Z7gMSba2xv',
          object: 'card',
          last4: '4242',
          brand: 'Visa',
          exp_month: 11,
          exp_year: 2016,
        })
      }
    })
  },
  save: function (userId, card) {
    var self = this

    if (!userId) {
      throw new Promise.OperationalError('The specified user could not be found.')
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
      throw new Promise.OperationalError('Incomplete creditcard details.')
    }

    var user = User.findById(userId)
      .then(function(user) {
      if (!user) {
        throw new Promise.OperationalError('The specified user could not be found.')
      }

      return user
    })

    var stripeCustomer = user.then(function(user) {
      if (!user.stripeToken) {
        return self.customerCreate(user)
      }
      throw new Promise.OperationalError('User already created so skip this step.')
    }).then(function(stripeUser) {
      return stripeUser.id
    }).error(function (err) {
      // Skip
      return false
    }).catch(function (err) {
      throw new Promise.OperationalError(err)
    })

    var userToken = Promise.all([user, stripeCustomer]).spread(function(user, stripeCustomer) {
      if (stripeCustomer !== false) {
        user.stripeToken = stripeCustomer
      }

      return user.save()
    })

    // Here need to add credit card to existing customer token (user.stripeToken)
    var token = userToken.then(function(userToken) {
      return self.create(userToken.stripeToken, {
        creditcard: creditcard.creditcard,
        expiryMonth: creditcard.expiryMonth,
        expiryYear: creditcard.expiryYear,
        cvv: creditcard.cvv
      })
    }).error(function (err) {
      throw new Promise.OperationalError(err)
    }).catch(function (err) {
      throw new Promise.OperationalError(err)
    })

    var creditCard = Promise.all([user, token]).spread(function(user, token) {
      var newCreditCard = new CreditCard({
        name: creditcard.name,
        token: token.id,
        number: token.last4,
        brand: token.brand,
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
      return err
    })
  }
}
