var mongoose = require('mongoose')
var Promise = require('bluebird')

var schema = new mongoose.Schema({
  state: Boolean,
  logs: [{
    state: Boolean,
    timestamp: String
  }]
})

module.exports = mongoose.model('system', schema)
