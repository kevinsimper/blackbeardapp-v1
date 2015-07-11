var mongoose = require('mongoose')

var schema = new mongoose.Schema({
  name: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  timestamp: String,
  containers: [{
    status: String,
    region: String,
    ip: String
  }]
})

module.exports = mongoose.model('app', schema)
