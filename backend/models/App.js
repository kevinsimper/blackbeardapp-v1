var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')
var Promise = require('bluebird')

var schema = new mongoose.Schema({
  name: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  timestamp: String,
  containers: [{type: mongoose.Schema.Types.ObjectId, ref: 'container'}],
  image: {type: mongoose.Schema.Types.ObjectId, ref: 'image'},
  environments: [{
    key: String,
    value: String
  }],
  port: String,
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

schema.statics.findByUserAndRole = function (user, role, cb) {
  var fields = []

  // As default do not show deleted
  var conditions = {}

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('name', 'timestamp', 'containers', 'image', 'environments', 'deleted', 'deletedAt', 'user', 'port')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {}

  return this.where('user', user).where(conditions).select(fields.join(' ')).find(cb)
}

module.exports = mongoose.model('app', schema)
