var mongoose = require('mongoose')
var mongooseDelete = require('mongoose-delete')

var status = {
  CLAIMED: 'CLAIMED',
  UNCLAIMED: 'UNCLAIMED'
}

var schema = new mongoose.Schema({
	codePlain: Number,
  code: String,
  amount: Number,
  createdAt: String,
  modifiedAt: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  email: String,
  note: String,
  status: { type: String, default: status.UNCLAIMED },
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

module.exports = mongoose.model('voucher', schema)

module.exports.status = status