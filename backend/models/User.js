var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')
var _ = require('lodash')
var CreditCard = require('./CreditCard')

var schema = new mongoose.Schema({
  email: String,
  name: String,
  username: String,
  credit: Number,
  timestamp: String,
  resetToken: String,
  resetExpiry: String,
  creditCards: [{type: mongoose.Schema.Types.ObjectId, ref: 'CreditCard'}],
  role: String,
  ip: String,
  password: String,
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

schema.statics.getUserIdFromRequest = function(request) {
  if(request.params.user === 'me') {
    return request.auth.credentials._id
  } else {
    return request.params.user
  }
}

// Potentially remove this
schema.statics.isUsersCard = function (role, id, card, cb) {
  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if (roles.isAllowed(roles.ADMIN, role)) {
    conditions = {}
  }

  return this.where('_id', id).where(conditions).findOne(function(error, result) {
    return cb(null, (!error && _.includes(result.creditCards, card)))
  })
}

schema.statics.findOneByRole = function (role, id, cb) {
  var fields = []
  // As default do not show deleted
  var conditions = {
      deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('email', 'name', 'credit', 'timestamp', 'creditCards', 'role', 'username')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('resetToken', 'resetExpiry', 'deleted')
    // Show deleted to admins
    conditions = {}
  }

  return this.where('_id', id).where(conditions).select(fields.join(' ')).findOne(function(error, result) {
    if (error) {
      return cb(error, null)
    }

    if (result && result.creditCards && result.creditCards.length) {
      CreditCard.findByIdsAndRole(result.creditCards, role, function (err, creditCards) {
        result.creditCards = creditCards
        return cb(null, result)
      })
    } else {
      return cb(null, result)
    }
  })
}

module.exports = mongoose.model('user', schema)
