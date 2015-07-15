var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  timestamp: String,
  ip: String
})

schema.statics.findOneByRole = function (role, id, cb) {
  var fields = ''
  if (role != roles.ADMIN) {
    fields = 'name email message timestamp'
  }

  return this.where('_id', id).select(fields).findOne(cb)
}

module.exports = mongoose.model('support', schema)
