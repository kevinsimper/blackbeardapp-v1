var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID;
var config = require('../config')

exports.postSignup = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) return console.log(err);

    var collection = db.collection('users');

    // Insert new user
    var email = request.payload.email;
    collection.insert({
      email: email,
      active: false,
      timestamp: Math.round(Date.now() / 1000)
    }, function(err, result) {
      if (err) {
        reply('error').code(500)
      } else {
        reply('ok')
      }

      db.close();
    });
  });
};

exports.postContact = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) return console.log(err);

    var collection = db.collection('enquiries');

    var name = request.payload.name;
    var email = request.payload.email;
    var message = request.payload.message;
    collection.insert({
      name: name,
      email: email,
      message: message,
      timestamp: Math.round(Date.now() / 1000)
    }, function(err, result) {
      if (err) {
        reply('error').code(500)
      } else {
        reply('ok')
      }

      db.close();
    });
  });
}