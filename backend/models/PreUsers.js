var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  email: String,
  active: Boolean,
  timestamp: String,
  ip: String
})

module.exports = mongoose.model('preusers', schema)
