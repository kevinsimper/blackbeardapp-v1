var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  timestamp: String,
  data: [],
  ip: String,
  type: String,
  error: String
})

module.exports = mongoose.model('log', schema)

module.exports.types = {
  LOGIN: 'LOGIN',
  LOGIN_FAIL: 'LOGIN_FAIL',
  VOUCHER_CLAIM: 'VOUCHER_CLAIM',
  REGISTRY_LOGIN: 'REGISTRY_LOGIN'
}

module.exports.errors = {
  NO_USER: 'NO_USER',
  INVALID_PASS: 'INVALID_PASS'
}
