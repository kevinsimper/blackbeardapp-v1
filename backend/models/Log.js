var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  timestamp: String,
  data: [],
  ip: String,
  type: String
})

module.exports = mongoose.model('log', schema)

module.exports.types = {
  LOGIN: 'LOGIN',
  VOUCHER_CLAIM: 'VOUCHER_CLAIM'
}