var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  name: String,
  timestamp: String
})

module.exports = mongoose.model('image', schema)
