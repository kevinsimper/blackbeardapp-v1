var Boom = require('boom')
var User = require('../models/User')

exports.getCreditCards = function(request, reply) {
  User.findOne({ _id: request.auth.credentials._id}, function(err, user) {
    return reply(user.creditCards)
  })
}

// /user/XX/creditcards POST
exports.postCreditCards = function(request, reply) {
  var id = request.params.id

  var updateCallback = function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    reply({ status: 'Creditcard successfully saved.' })
  }

  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    if (!user) {
      return reply(Boom.notFound('The specified user could not be found.'))
    }

    var creditcard = {
      name: request.payload.name,
      creditcard: request.payload.creditcard,
      expiryMonth: request.payload.expiryMonth,
      expiryYear: request.payload.expiryYear,
      cvv: request.payload.cvv
    }

    if (!user.creditcard) {
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
  var id = null
  if(request.params.id === 'me') {
    id = request.auth.credentials._id
  } else {
    return reply(Boom.unauthorized('Can\'t access other users!'))
  }

  var updateCallback = function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    reply({ status: 'Creditcard successfully removed.' })
  }

  User.findOne({ _id: id }, function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database.'))
    }

    if (!user) {
      return reply(Boom.notFound('The specified user could not be found.'))
    }

    var name = request.payload.name

    if (!user.creditCards) {
      return reply(Boom.notFound('The creditcard specified could not be found.'))
    }

    var record = _.findIndex(user.creditCards, function(creditcard) {
      return creditcard.name == name;
    });

    if (record == -1) {
      return reply(Boom.notFound('The creditcard specified could not be found.'))
    }

    user.creditCards.splice(record)

    user.save(updateCallback)
  })
}
