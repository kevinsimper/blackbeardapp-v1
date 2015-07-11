var Boom = require('boom')
var User = require('../models/User')
var _ = require('lodash')

exports.getCreditCards = function(request, reply) {
  User.findOne({ _id: request.auth.credentials._id}, function(err, user) {
    return reply(user.creditCards)
  })
}

// /user/XX/creditcards POST
exports.postCreditCards = function(request, reply) {
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

    reply(creditcard)
  }

  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    if (!user) {
      return reply(Boom.notFound('The specified user could not be found.'))
    }

    if (!user.creditCards) {
      user.creditCards = []
    }

    // Validate credit card
    if (!creditcard.name || !creditcard.creditcard || !creditcard.expiryMonth || !creditcard.expiryYear || !creditcard.cvv) {
      return reply(Boom.notAcceptable('Incomplete creditcard details.'))
    }

    user.creditCards.push(creditcard)

    user.save(updateCallback)
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
