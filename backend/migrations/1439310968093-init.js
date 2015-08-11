var MongoClient = require('mongodb').MongoClient
var config = require('../config')

exports.up = function(next) {
  MongoClient.connect(config.DATABASE_URL, function (err, db) {
    var users = db.collection('users')
    users.findAndModify({
      role: {
        $exists: false
      }
    }, [['_id','asc']], {$set: {role: 'user'}}, {new:true}, function(err, results) {
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
