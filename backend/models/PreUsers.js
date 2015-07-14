var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  email: {
    type: String,
    minlength: 6
  },
  active: Boolean,
  timestamp: String,
  ip: String,
  comment: String
})

schema.statics.findOneByRole = function (role, id, cb) {
  var fields = ''
  if (role != roles.ADMIN) {
    fields = 'email active timestamp comment'
  }

  return this.where('_id', id).select(fields).findOne(cb)
}

module.exports = mongoose.model('preusers', schema)
