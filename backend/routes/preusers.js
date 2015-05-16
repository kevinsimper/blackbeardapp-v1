var MongoClient = require('mongodb').MongoClient
var Boom = require('boom')
var config = require('../config')
var PreUsers = require('../models/PreUsers')

exports.getPreUsers = function(request, reply) {
  PreUsers.find(function(err, preUsers) {
    if(err) {
      return reply(Boom.badImplementation())
    }  
    reply(preUsers)
  })
}