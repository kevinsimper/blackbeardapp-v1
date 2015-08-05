var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  amount: Number,
  creditCard: {type: mongoose.Schema.Types.ObjectId, ref: 'creditcard'},
  chargeId: String, // Charge id from Stripe API
  status: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  timestamp: String,
  ip: String
})

schema.statics.findByUserAndRole = function (user, role, cb) {
  var fields = []

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('amount', 'timestamp', 'status')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('creditCard', 'chargeId', 'user', 'ip')
  }

  return this.where({user: user}).select(fields.join(' ')).populate('creditCard').find(cb)
}

module.exports = mongoose.model('payment', schema)
