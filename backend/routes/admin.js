var MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID,
  passwordHash = require('password-hash'),
  isint = require('isint')

var config = require('../config')

exports.getAdminUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users_soon')

    var adminHash = request.query.admin
    if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      reply('Invalid Admin Authorization Code.').code(401)
      db.close()
    } else {
      var userHash = request.query.userHash

      if (!userHash) {
        var limit = request.query.limit
        var offset = request.query.offset

        if (!isint.uint32(limit)) {
          limit = 100
        }
        if (!isint.uint32(offset)) {
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
              reply({
                email: user.email,
                timestamp: user.timestamp
              })
            } else {
              reply('User not found.').code(404)
            }
          }

          db.close()
        }

        collection.findOne({
          _id: ObjectID(userHash)
        }, getUserResponse)
      }
    }
  })
}


exports.putAdminUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users_soon')

    var adminHash = request.payload.admin
    if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      reply('Invalid Admin Authorization Code.').code(401)

      db.close()
    } else {
      var userHash = request.payload.userHash
      var email = request.payload.email
      var password = request.payload.password

      collection.findOne({
        _id: ObjectID(userHash)
      }, function(err, user) {
        if (err) {
          reply('Internal server error.').code(500)

          db.close()
        } else {
          var hashedPassword = passwordHash.generate(password)

          if (user) {
            collection.update({
                _id: ObjectID(userHash)
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



exports.deleteAdminUser = function(request, reply) {
  MongoClient.connect(config.DATABASE_URL, function(err, db) {
    if (err) {
      reply('An internal server error has occurred.').code(500)
    }

    var collection = db.collection('users_soon')

    var adminHash = request.payload.admin
    if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      reply('Invalid admin authorization code.').code(401)
      db.close()
    } else {
      var userHash = request.payload.userHash

      collection.remove({
        _id: ObjectID(userHash)
      }, function(err, count) {
        if (err) {
          reply('An error has occurred while removing the user.').code(500)
        } else {
          if (count) {
            reply('User successfully updated.').code(200)
          } else {
            reply('User not found.').code(404)
          }
        }
        db.close()
      })
    }
  })
}