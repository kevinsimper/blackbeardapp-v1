var mongoose = require('mongoose')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
	limit: { type: Number, default: 1 }, // Default to single voucher claimant
	used: { type: Number, default: 0 }, // Default to unused
	codePlain: Number,
  code: String,
  email: String,
  amount: Number,
  createdAt: String,
  modifiedAt: String,
  note: String,
  claimants: [{type: mongoose.Schema.Types.ObjectId, ref: 'voucherclaimant'}],
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

module.exports = mongoose.model('voucher', schema)