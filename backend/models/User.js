var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  credit: Number,
  timestamp: String,
  ip: String,
  resetToken: String,
  resetExpiry: String,
  creditCards: [{
    name: String,
    creditcard: String,
    expiryMonth: String,
    expiryYear: String,
    cvv: String
  }]
})

module.exports = mongoose.model('user', schema)
