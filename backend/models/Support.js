var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  timestamp: String,
  ip: String
})

module.exports = mongoose.model('support', schema)
