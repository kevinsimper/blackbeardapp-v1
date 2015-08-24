var mongoose = require('mongoose')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
  code: String,
  amount: Number
  createdAt: String,
  modifiedAt: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  email: String,
  note: String,
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

module.exports = mongoose.model('voucher', schema)
