var Promise = require('bluebird')
var Image = Promise.promisifyAll(require('../models/Image'))
var User = Promise.promisifyAll(require('../models/User'))
var Boom = require('boom')

exports.postNotifyImage = function(request, reply) {
  var username = request.payload.user
  var name = request.payload.name

  var user = User.findOneAsync({username: username})

  var findImage = user.then(function(foundUser) {
    if (!foundUser) {
      throw new Promise.OperationalError("User not found")
    } else {
      return Image.findOneAsync({ name: name })
    }
  })

    Promise.all([user, findImage]).spread(function(user, image) {
      if (!image) {
     // Create image
      var newImage = new Image({
        user: user,
        name: name,
        createdAt: Math.round(Date.now() / 1000),
        modifiedAt: Math.round(Date.now() / 1000)
      })

      return new Promise(function (resolve, reject) {
        newImage.save(function (err, savedImage) {
          if (err) {
            reject(err)
          } else {
            resolve(savedImage)
          }
        })
      })
    } else {
      var modifiedTime = Math.round(Date.now() / 1000)
      image.modifiedAt = modifiedTime
      image.logs.push({timestamp: modifiedTime})
      image.user = user

      return new Promise(function (resolve, reject) {
        image.save(function (err, savedImage) {
          if (err) {
            reject(err)
          } else {
            resolve(savedImage)
          }
        })
      })
    }
  }).then(function(image) {
    reply("ok")
  }).catch(Promise.OperationalError, function (e) {
    // Not outputting error on purpose to stop people hitting the API
    // to find active usernames
    reply("ok")
  }).catch(function(e) {
    console.log(e)
    reply(Boom.badImplementation())
  })
}
