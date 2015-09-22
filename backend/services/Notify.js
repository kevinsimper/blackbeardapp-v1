var Promise = require('bluebird')
var Mail = require('./Mail')
var User = require('../models/User')
var Roles = require('../models/roles/')

exports.notifyAdmins = function () {
  var admins = User.find({
    role: Roles.ADMIN
  })

  return admins.then(function (admins) {
    Promise.map(admins, function (admin) {
      return Promise.fromNode(function (callback) {
        Mail.send({
          from: 'system@blackbeard.io',
          to: admin.email,
          subject: 'No green clusters!',
          text: 'There is no green clusters left!'
        }, callback)
      })
    })
  })
}
