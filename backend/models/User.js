var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')
var _ = require('lodash')

// Credit cards here are changing from inline
/*creditCards: [{
 name: String,
 number: String,
 brand: String,
 expiryYear: String,
 token: String
 }],*/
// To a reference to the object CreditCard
var creditCardSchema = new mongoose.Schema({
  name: String,
  number: String,
  brand: String,
  expiryYear: String,
  token: String,
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

var schema = new mongoose.Schema({
  email: String,
  name: String,
  credit: Number,
  timestamp: String,
  resetToken: String,
  resetExpiry: String,
  creditCards: [creditCardSchema],
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

schema.statics.findOneByRole = function (role, id, cb) {
  var fields = []
  // As default do not show deleted
  var conditions = {
      deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('email', 'name', 'credit', 'timestamp', 'creditCards', 'role')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('resetToken', 'resetExpiry', 'deleted')
    // Show deleted to admins
    conditions = {}
  }

  return this.where('_id', id).where(conditions).select(fields.join(' ')).findOne(function(error, result) {
    // If there is a result and user is not ADMIN then hide payment gateway token
    if (result && roles.isAllowed(roles.USER, role)) {
      _.forEach(result.creditCards, function(creditCard, ccKey) {
        var creditCardSensored = {
          name: creditCard.name,
          number: creditCard.number,
          brand: creditCard.brand
        }
        result.creditCards[ccKey] = creditCardSensored
      })
    }

    return cb(error, result)
  })
}

module.exports = mongoose.model('user', schema)
