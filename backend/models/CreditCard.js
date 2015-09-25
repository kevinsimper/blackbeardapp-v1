var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
  name: String,
  number: String,
  brand: String,
  expiryYear: String,
  token: String,
  country: String,
  active:  { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

var getFieldsAndConditions = function (role) {
  var fields = []
  // As default do not show deleted
  var conditions = {
    deleted: false
  }

  if(roles.isAllowed(roles.USER, role)) {
    fields.push('name', 'number', 'brand', 'active', 'country')
  }

  if(roles.isAllowed(roles.ADMIN, role)) {
    fields.push('expiryYear', 'token', 'deleted', 'deletedAt')
    // Show deleted to admins
    conditions = {}
  }

  return {
    fields: fields,
    conditions: conditions
  }
}

schema.statics.findOneByRole = function (id, role, cb) {
  var fieldsAndConditions = getFieldsAndConditions(role)

  return this.where('_id', id).where(fieldsAndConditions.conditions).select(fieldsAndConditions.fields.join(' ')).findOne(cb)
}

schema.statics.findByIdsAndRole = function (ids, role, cb) {
  var fieldsAndConditions = getFieldsAndConditions(role)

  return this.where({'_id': { $in: ids }}).where(fieldsAndConditions.conditions).select(fieldsAndConditions.fields.join(' ')).find(cb)
}

module.exports = mongoose.model('creditcard', schema)
