var MongoClient = require('mongodb').MongoClient
var config = require('../config')
var PreUsers = require('../models/PreUsers')

exports.getPreUsers = function(request, reply) {
  PreUsers.find(function(err, preUsers) {
      reply(preUsers)
  })
}