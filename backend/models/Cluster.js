var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  status: String,
  type: String,
  machines: Number,
  createdAt: String,
  certificates: {
    ca: String,
    cert: String,
    key: String
  }
})

module.exports = mongoose.model('cluster', schema)
