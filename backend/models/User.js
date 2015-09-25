var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')
var _ = require('lodash')

var schema = new mongoose.Schema({
  email: String,
  name: String,
  username: String,
  credit: Number,
  virtualCredit: Number,
  timestamp: String,
  resetToken: String,
  resetExpiry: String,
  stripeToken: String,
  creditCards: [{type: mongoose.Schema.Types.ObjectId, ref: 'creditcard'}],
  role: String,
  ip: String,
  password: String,
  verified: { type: Boolean, default: false },
  verifyCode: String,
  containerLimit: {type: Number, default: 20},
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

schema.statics.findOneByRole = function (id, role, cb) {
  var fields = []
  // As default do not show deleted
  var conditions = {
      deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('email', 'name', 'credit', 'timestamp', 'creditCards', 'role', 'username', 'verified', 'containerLimit', 'country')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('resetToken', 'resetExpiry', 'stripeToken', 'verifyCode', 'deleted', 'deletedAt')
    // Show deleted to admins
    conditions = {}
  }

  return this.where('_id', id).where(conditions).select(fields.join(' ')).findOne(cb)
}

module.exports = mongoose.model('user', schema)
