var migrate = require('migrate')
var fs = require('fs')
var Set = require('migrate/lib/set')
var MongoClient = require('mongodb').MongoClient
var config = require('./config')

Set.prototype.save = function (fn) {
  var self = this
  var json = JSON.stringify(this)
  var data = JSON.parse(json)

  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    var collection = db.collection('migrations')
    collection.deleteMany({}, function() {
      collection.insertOne(data, function(err, r) {
        db.close()
        self.emit('save')
        if (err) {
          console.log(err)
          return fn(err)
        }
        fn(null)
      })
    })
  })
}

Set.prototype.load = function (fn) {
  this.emit('load')

  MongoClient.connect(config.DATABASE_URL, function (err, db) {
    var collection = db.collection('migrations')
    collection.findOne({
      migrations: {
        $exists: true
      }
    }).then(function (doc) {
      // If we do not find any documents
      // that means we have not run any migrations yet
      // The library where prepared on that error,
      // by looking for the ENOENT which means no file exist
      // but we are not reading files, so we are just replying
      // with position zero
      if(doc) {
        fn(null, doc)
      } else {
        fn(null, {pos: 0})
      }
    }).catch(function (err) {
      console.log(err)
      fn(err)
    })
  })
}

require('migrate/bin/migrate')
