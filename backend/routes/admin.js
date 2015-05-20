var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID,
  passwordHash = require('password-hash'),
  _ = require('lodash')

var config = require('../config')

// /admin/user
exports.getAdminUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users')

    var adminHash = request.query.admin
    if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      reply('Invalid Admin Authorization Code.').code(401)
      db.close()
    } else {
      var userId = request.query.userId

      if (!userId) {
        var limit = _.parseInt(request.query.limit)
        var offset = _.parseInt(request.query.offset)

        if (isNaN(limit)) {
          limit = 100
        }
        if (isNaN(offset)) {
          offset = 0
        }

        var getUsersResponse = function(err, users) {
          if (err) {
            reply('Internal server error.').code(500)
          } else {
            if (users) {
              reply(users.toArray())
            } else {
              reply('No users found.').code(404)
            }
          }

          db.close()
        }

        var options = {
            "limit": limit,
            "skip": offset,
            "sort": "email"
        }
        collection.find({}, options).toArray(function(err, users) {
          reply(users)
        })
      } else {
        var getUserResponse = function(err, user) {
          if (err) {
            reply('Internal server error.').code(500)
          } else {
            if (user) {
              reply(user)
            } else {
              reply('User not found.').code(404)
            }
          }

          db.close()
        }

        collection.findOne({
          _id: ObjectID(userId)
        }, getUserResponse)
      }
    }
  })
}

// /admin/user
exports.putAdminUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users')

    var adminHash = request.payload.admin
    if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      reply('Invalid Admin Authorization Code.').code(401)

      db.close()
    } else {
      var userId = request.payload.userId
      var email = request.payload.email
      var password = request.payload.password

      collection.findOne({
        _id: ObjectID(userId)
      }, function(err, user) {
        if (err) {
          reply('Internal server error.').code(500)

          db.close()
        } else {
          var hashedPassword = passwordHash.generate(password)

          if (user) {
            collection.update({
                _id: ObjectID(userId)
              }, {
                $set: {
                  email: email
                }
              },
              function(err, result) {
                if (err) {
                  reply('Internal server error.').code(500)
                } else {
                  reply('User successfully updated.').code(404)
                }

                db.close()
              }
            )
          } else {
            reply('User not found.').code(404)

            db.close()
          }
        }
      })
    }
  })
}

// /admin/user
exports.deleteAdminUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users')

    var adminHash = request.payload.admin
    if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      reply('Invalid admin authorization code.').code(401)
      db.close()
    } else {
      var userId = request.payload.userId

      collection.remove({
        _id: ObjectID(userId)
      }, function(err, count) {
        if (err) {
          reply('An error has occurred while removing the user.').code(500)
        } else {
          if (count) {
            reply('User successfully removed.').code(200)
          } else {
            reply('User not found.').code(404)
          }
        }
        db.close()
      })
    }
  })
}