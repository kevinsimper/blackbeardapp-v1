var mongoose = require('mongoose')
var roles = require('./roles/')
var mongooseDelete = require('mongoose-delete')

var schema = new mongoose.Schema({
  status: String,
  region: String,
  ip: String,
  port: Number,
  app: {type: mongoose.Schema.Types.ObjectId, ref: 'app'},
  createdAt: String,
  deleted: { type: Boolean, default: false },
  deletedAt: String,
  cluster: {type: mongoose.Schema.Types.ObjectId, ref: 'cluster'},
  containerHash: String,
  memory: Number,
  dockerContentDigest: String
})

schema.plugin(mongooseDelete)

schema.statics.findByIds = function (ids, cb) {
  return this.where({'_id': { $in: ids }}).find(cb)
}

schema.statics.findByIdsAndRole = function (ids, role, cb) {
  var conditions = {}
  return this.where({'_id': { $in: ids }}).where(conditions).find(cb)
}

schema.statics.findOneByRole = function (id, role, cb) {
  var conditions = {}
  return this.where({'_id': id}).where(conditions).findOne(cb)
}

module.exports = mongoose.model('container', schema)

module.exports.status = {
  UP: 'UP',
  DEPLOYING: 'DEPLOYING',
  FAILED: 'FAILED',
  DOWN: 'DOWN'
}
