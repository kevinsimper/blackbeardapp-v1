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

module.exports = mongoose.model('preusers', schema)
