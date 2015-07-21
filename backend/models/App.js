var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  name: String,
  cname: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  timestamp: String,
  containers: [{
    status: String,
    region: String,
    ip: String
  }]
})

schema.statics.findOneByRole = function (role, id, cb) {
  var fields = ''
  if (role != roles.ADMIN) {
    fields = 'name cname user timestamp'
  }

  return this.where('_id', id).select(fields).findOne(cb)
}

module.exports = mongoose.model('app', schema)
