var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  name: String,
  createdAt: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  modifiedAt: String
})

schema.statics.findByUserAndRole = function (user, role, cb) {
  var fields = []

  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('name')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('createdAt', 'modifiedAt')
    // Show deleted and not deleted to admins
    conditions = {}
  }

  return this.where('user', user).where(conditions).select(fields.join(' ')).find(cb)
}

module.exports = mongoose.model('image', schema)
