var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var _ = require('lodash')
var Boom = require('boom')
var jwt = require('jsonwebtoken')
var User = require('../models/User')
var MailgunJs = require('mailgun-js')

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

exports.inviteUser = function(request, reply) {
  var token = request.query.token
  var userId = request.query.userId
  var credit = request.query.credit
  if (!credit) {
    // Default credit to 10
    credit = 10;
  }

  try {
    var decoded = jwt.verify(token, config.AUTH_SECRET)
  } catch (err) {
    return reply(Boom.unauthorized('Invalid authentication token supplied.'))
  }

  var updateCallback = function(err, user) {
    if (err) {
      return reply(Boom.badImplementation('There was a problem with the database'))
    }

    var mailgun = MailgunJs({apiKey: config.MAILGUN.key, domain: config.MAILGUN.domain});

    var data = {
        from: 'Blackbeard <info@blackbeard.io>',
        to: user.email,
        subject: 'Blackbeard Credit Applied!',
        text: "Your new account at Blackbeard has been credited for $"+credit+". To use this credit and take "+
          "advantage of the hosting services provided by Blackbeard please login at http://blackbeard.io."+
          "\n\nRegards,\nThe team at Blackbeard"
    }

    mailgun.messages().send(data, function (error, body) {
      reply({
        status: 'Invitation successfully sent.',
        mailgunResponse: body
      })
    })
  }

  User.findOne({ _id: userId }, function(err, user) {
    if (user) {
      var newCredit = user.credit + credit
      user.credit = newCredit
      user.save(updateCallback)
    } else {
      reply(Boom.badRequest('Could not find user account.'))
    }
  })
}
