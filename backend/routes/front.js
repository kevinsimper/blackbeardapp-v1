var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID;
var config = require('../config')

console.log(config)

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
      timestamp: Math.round(Date.now() / 1000),
      ip: request.info.remoteAddress
    }, function(err, result) {
      if (err) {
        reply({
          status: 'Error'
        }).code(500)
      }
      reply({
        status: 'OK'
      })

      db.close();
    });
  });
}

exports.postSignup = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) return console.log(err);
    // Insert new user
    var email = request.payload.email;

    console.log(email)
    var collection = db.collection('preusers');
    collection.findOne({
      email: email
    }, function(err, result) {
      if(result === null) {
        insertEmail()
      } else {
        reply({
          status: 'Already signed up'
        })
      }
    })

    function insertEmail() {
      collection.insert({
        email: email,
        active: false,
        timestamp: Math.round(Date.now() / 1000)
      }, function(err, result) {
        if (err) {
          reply('error').code(500)
        } else {
          reply({
            status: 'You successful signup to the waiting list'
          })
        }

        db.close();
      });
    }
      
  });
};