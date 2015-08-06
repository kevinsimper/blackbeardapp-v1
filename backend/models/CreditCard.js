var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
  name: String,
  number: String,
  brand: String,
  expiryYear: String,
  token: String,
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

schema.statics.findOneByRole = function (id, role, cb) {
  var fields = []
  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('name', 'number', 'brand')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('expiryYear', 'token', 'deleted', 'deletedAt')
    // Show deleted to admins
    conditions = {}
  }

  return this.where('_id', id).where(conditions).select(fields.join(' ')).findOne(cb)
}

schema.statics.findByIdsAndRole = function (ids, role, cb) {
  var fields = []
  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('name', 'number', 'brand')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('expiryYear', 'token', 'deleted', 'deletedAt')
    // Show deleted to admins
    conditions = {}
  }

  return this.where({'_id': { $in: ids }}).where(conditions).select(fields.join(' ')).find(cb)
}

module.exports = mongoose.model('creditcard', schema)
