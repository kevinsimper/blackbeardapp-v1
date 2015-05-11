var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID,
  passwordHash = require('password-hash')
var config = require('../config')

exports.postUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users_soon')

    var email = request.payload.email
    var password = request.payload.password
    var hashedPassword = passwordHash.generate(password)

    var insertCallback = function(err, result) {
      if (err) {
        reply('An internal server error has occurred').code(500)
      } else {
        reply('User successfully added.').code(200)
      }

      db.close() // Replace this with the user of a promise
    }

    var resultCallback = function(err, user) {
      if (err) {
        reply('An error has occurred while removing the user.').code(500)
        db.close()
      } else {
        if (user) {
          reply('A user account with this email address already exists.').code(500)
          db.close() // Replace this with the user of a promise
        } else {
          collection.insert({
            email: email,
            password_hashed: hashedPassword,
            timestamp: Math.round(Date.now() / 1000)
          }, insertCallback)
        }
      }
    }

    collection.findOne({
      email: email
    }, resultCallback)
  })
}

exports.postLogin = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users_soon')

    var email = request.payload.email
    var password = request.payload.password

    collection.findOne({
      email: email
    }).toArray(function(err, user) {
      if (user) {
        if (passwordHash.verify(password, user.password_hashed)) {
          reply('Login successful.').code(200)
        } else {
          reply('Invalid email and password combination.').code(215)
        }
      } else {
        reply('Invalid email and password combination.').code(215)
      }

      db.close()
    })
  })
}