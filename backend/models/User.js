var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  email: String,
  password: String,
  timestamp: String,
  ip: String
})

module.exports = mongoose.model('user', schema)