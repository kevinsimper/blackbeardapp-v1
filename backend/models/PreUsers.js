var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  email: {
    type: String,
    minlength: 6
  },
  active: Boolean,
  timestamp: Date,
  ip: String,
  comment: String
})

module.exports = mongoose.model('preusers', schema)
