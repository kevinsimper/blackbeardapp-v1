var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  amount: Number,
  cardToken: String, // Stripe token for credit card
  chargeId: String, // Charge id from Stripe API
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  timestamp: String,
  ip: String
})

schema.statics.findOneByRole = function (role, id, cb) {
  var fields = []
  // As default do not show deleted
  var conditions = {
      deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('amount', 'timestamp')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('cardToken', 'chargeId', 'user', 'ip')
    // Show deleted to admins
    conditions = {}
  }

  return this.where('_id', id).where(conditions).select(fields.join(' ')).findOne(cb)
}

module.exports = mongoose.model('payment', schema)
