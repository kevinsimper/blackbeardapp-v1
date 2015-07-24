var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  status: String,
  region: String,
  ip: String
})

module.exports = mongoose.model('container', schema)
