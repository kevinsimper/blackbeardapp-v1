var mongoose = require('mongoose')
var roles = require('./roles/')

var schema = new mongoose.Schema({
  email: String,
  name: String,
  credit: Number,
  timestamp: String,
  resetToken: String,
  resetExpiry: String,
  creditCards: [{
    name: String,
    creditcard: String,
    expiryMonth: String,
    expiryYear: String,
    cvv: String,
    stripeToken: String
  }],
  role: String,
  ip: String,
  password: String,
})

schema.statics.getUserIdFromRequest = function(request) {
  if(request.params.user === 'me') {
    return request.auth.credentials._id
  } else {
    return request.params.user
  }
}

module.exports = mongoose.model('user', schema)
