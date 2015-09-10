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
    key: String,
    sshPublic: String,
    sshPrivate: String,
    sshUser: String
  },
  containers: [{type: mongoose.Schema.Types.ObjectId, ref: 'container'}],
  deleted: { type: Boolean, default: false },
  deletedAt: String,
  memory: { type: Number, default: 2048 },
  ip: String
})

schema.plugin(mongooseDelete)

module.exports = mongoose.model('cluster', schema)
