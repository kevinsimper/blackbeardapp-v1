var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  voucher: {type: mongoose.Schema.Types.ObjectId, ref: 'voucher'},
 	user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  claimedAt: String
})

module.exports = mongoose.model('voucherclaimant', schema)
