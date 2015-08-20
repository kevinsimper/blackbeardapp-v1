var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  status: String,
  type: String,
  machines: Number,
  createdAt: String
})

module.exports = mongoose.model('cluster', schema)
