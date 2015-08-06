var Promise = require('bluebird')
var Image = Promise.promisifyAll(require('../models/Image'))
var User = Promise.promisifyAll(require('../models/User'))
var Boom = require('boom')

exports.postNotifyImage = function(request, reply) {
  var username = request.payload.user
  var name = request.payload.name

  var user = User.findOneAsync({username: username})

  user.then(function(foundUser) {
    if (!foundUser) {
      throw "User not found"
    } else {
      return Image.findOneAsync({ name: name })
    }
  }).then(function(image) {
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
  }).catch(function(e) {
    if (e === "User not found") {
      console.log(e)
      reply("ok")
    } else {
      console.log(e)
      reply(Boom.badImplementation())
    }
  })
}
