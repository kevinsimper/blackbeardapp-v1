var MongoClient = require('mongodb').MongoClient
var config = require('../config')

exports.getPreUsers = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    db.collection('preusers').find({}).toArray(function(err, docs) {
      reply(docs)
    })
  })
}