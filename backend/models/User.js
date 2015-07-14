var mongoose = require('mongoose')
var roles = require('./roles/')

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
  }],
  role: String
})

schema.statics.getUserIdFromRequest = function(request) {
  if(request.params.user === 'me') {
    return request.auth.credentials._id
  } else {
    return request.params.user
  }
}

schema.methods.getProperties = function (role) {
  var properties = {
    email: this.email,
    name: this.name,
    role: this.role
  }
  if (role == roles.ADMIN) {
    properties.creditCards = this.creditCards
  }

  return properties
};

module.exports = mongoose.model('user', schema)
