var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  status: String,
  region: String,
  ip: String
})

schema.statics.findByIds = function (ids, role, cb) {
  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    // Show deleted and not deleted to admins
    conditions = {}
  }

  return this.where({'_id': { $in: ids }}).where(conditions).find(cb)
}

schema.statics.findByIdAndRole = function (id, role, cb) {
  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    // Show deleted and not deleted to admins
    conditions = {}
  }

  return this.where({'_id': id}).where(conditions).findOne(cb)
}

module.exports = mongoose.model('container', schema)
