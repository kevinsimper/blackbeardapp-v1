var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')

// Potentially make this it's own independant schema
var Container = {
  status: String,
  region: String,
  ip: String
}

var schema = new mongoose.Schema({
  name: String,
  cname: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  timestamp: String,
  containers: [Container],
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

schema.statics.findByUserAndRole = function (user, role, cb) {
  var fields = []

  // As default do not show deleted
  var conditions = {
      deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('name', 'cname', 'timestamp')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('user', 'containers', 'deleted')
    // Show deleted and not deleted to admins
    conditions = {}
  }

  return this.where('user', user).where(conditions).select(fields.join(' ')).find(cb)
}

module.exports = mongoose.model('app', schema)
