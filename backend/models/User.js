var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
  email: String,
  name: String,
  credit: Number,
  timestamp: String,
  resetToken: String,
  resetExpiry: String,
  creditCards: [{
    name: String,
    number: String,
    brand: String,
    expiryYear: String,
    token: String
  }],
  role: String,
  ip: String,
  password: String,
  deleted: Boolean,
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
      deleted: {
          '$ne': true
      }
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('email', 'name', 'credit', 'timestamp', 'creditCards', 'role')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('resetToken', 'resetExpiry')
    // Show deleted to admins
    var conditions = {
        deleted: {
            '$ne': false
        }
    }
  }

  return this.where('_id', id).where(conditions).select(fields.join(' ')).findOne(cb)
}

module.exports = mongoose.model('user', schema)
