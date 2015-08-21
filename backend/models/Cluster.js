var mongoose = require('mongoose')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
  status: String,
  type: String,
  machines: Number,
  createdAt: String,
  certificates: {
    ca: String,
    cert: String,
    key: String
  },
  deleted: { type: Boolean, default: false },
  deletedAt: String
})

schema.plugin(mongooseDelete)

module.exports = mongoose.model('cluster', schema)
