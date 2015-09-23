var Promise = require('bluebird')
var Mailgun = require('mailgun-js')
var fs = require('fs')
var mkdirp = require('mkdirp')
var Hashids = require('hashids')
var User = require('../models/User')

/**
* @param {object} data
* @param {string} data.from
* @param {string} data.to
* @param {string} data.subject
* @param {string} data.text
* @param {function} callback
*/
exports.send = function (data, callback) {
  if (process.env.NODE_ENV === 'production') {
    var mailgun = Mailgun({
      apiKey: process.env.MAILGUN_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });
    mailgun.messages().send(data, callback)
  } else {
    var filename = Date.now() + data.subject + '.json'
    mkdirp('./fixtures/mails/', function () {
      fs.writeFile('./fixtures/mails/' + filename, JSON.stringify(data, null, 2), function (err) {
        callback(err, {})
      })
    })
  }
}

exports.sendVerificationEmail = function(user) {
  var self = this
  if (user === null) {
    return self.result.USER_NOT_FOUND
  }

  if (user.verified) {
    return self.result.ALREADY_VERIFIED
  }

  var token = new Hashids("sweetySWEET", 64, "abcdefghijkmnpqrstuvwxyzABCDEFGHIJKMNPQRSTUVWXYZ23456789")
  user.verifyCode = token.encode([Math.floor(Date.now() / 1000), Math.floor(Math.random()*100)])

  var user = user.save()
  return user.then(function(user) {
    return Promise.fromNode(function (cb) {
      self.send({
        from: 'Blackbeard <info@blackbeard.io>',
        to: user.email,
        subject: 'Blackbeard - Verify Email Account',
        text: "Please click on the following link to verify your account. http://blackbeard.io/verify/" + user._id + "?code=" + user.verifyCode +
          "\n\nRegards,\nThe team at Blackbeard"
      }, cb)
    })
  }).then(function (body) {
    return self.result.SEND_SUCCESSFUL
  })
}

exports.result = {
  SEND_SUCCESSFUL: 'SEND_SUCCESSFUL',
  ALREADY_VERIFIED: 'ALREADY_VERIFIED',
  USER_NOT_FOUND: 'USER_NOT_FOUND'
}
