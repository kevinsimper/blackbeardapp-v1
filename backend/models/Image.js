var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  name: String,
  createdAt: String,
  modifiedAt: String
})

module.exports = mongoose.model('image', schema)
