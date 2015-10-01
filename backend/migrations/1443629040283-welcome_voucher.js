var MongoClient = require('mongodb').MongoClient
var config = require('../config')

exports.up = function(next) {
  var welcome = {
    "deleted" : false,
    "email" : null,
    "amount" : 300,
    "note" : "Welcome to Blackbeard :)",
    "createdAt" : "1443628956",
    "claimants" : [],
    "used" : 0,
    "limit" : null,
    "code" : "WELCOMETOBLACKBEARD"
  }

  MongoClient.connect(config.DATABASE_URL, function (err, db) {
    var vouchers = db.collection('vouchers')
    vouchers.insert(welcome, function(err, result) {
      if(err) {
        console.log(err)
      } else {
        next()
      }
    })
  })
};

exports.down = function(next) {
  next();
};
