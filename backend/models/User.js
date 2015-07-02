var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  email: String,
  password: String,
  credit: Number,
  timestamp: String,
  ip: String,
  resetToken: String,
  resetExpiry: String,
  creditCards: []
})

module.exports = mongoose.model('user', schema)
