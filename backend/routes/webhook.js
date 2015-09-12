var Promise = require('bluebird')
var Image = Promise.promisifyAll(require('../models/Image'))
var User = Promise.promisifyAll(require('../models/User'))
var Boom = require('boom')

exports.postNotifyImage = function(request, reply) {
  var username = request.payload.user
  var name = request.payload.name

  var user = User.findOneAsync({username: username})

  var timestamp = Math.round(Date.now() / 1000)

  var image = user.then(function(foundUser) {
    if (!foundUser) {
      throw new Promise.OperationalError("User not found")
    }
    return Image.findOne({ name: name })
  })
  var checkImage = Promise.all([user, image]).spread(function (user, image) {
    if(!image) {
      return new Image({
        user: user._id,
        name: name,
        createdAt: timestamp,
      })
    } else {
      return image
    }
  })

  checkImage.then(function (image) {
    image.logs.push({
      timestamp: timestamp
    })
    return image.save()
  }).then(function() {
    reply("ok")
  }).error(function () {
    // Not outputting error on purpose to stop people hitting the API
    // to find active usernames
    reply("ok")
  }).catch(function(err) {
    request.log(err)
    reply(Boom.badImplementation())
  })
}
