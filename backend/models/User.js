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

schema.statics.getUserIdFromRequest = function(request) {
  if(request.params.user === 'me') {
    return request.auth.credentials._id
  } else {
    return request.params.user
  }
}

module.exports = mongoose.model('user', schema)
