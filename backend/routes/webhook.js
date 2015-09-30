var Promise = require('bluebird')
var Image = require('../models/Image')
var User = require('../models/User')
var System = require('../models/System')
var Boom = require('boom')
var Queue = require('../services/Queue')

exports.postNotifyImage = function(request, reply) {
  var username = request.payload.user
  var name = request.payload.name
  var dockerContentDigest = request.payload.dockerContentDigest

  var timestamp = Math.round(Date.now() / 1000)

  var system = System.findOne().then(function(system) {
    if (!system.state) {
      throw new Promise.OperationalError('panic')
    }

    return system
  })

  var user = system.then(function(systemState) {
    return User.findOne({username: username}).then(function(user) {
      if (!user) {
        throw new Promise.OperationalError("User not found")
      }
      return user
    })
  })

  var image = user.then(function(user) {
    return Image.findOne({
      name: name,
      user: user._id
    })
  })
  var checkImage = Promise.all([user, image]).spread(function (user, image) {
    if(!image) {
      return new Image({
        user: user._id,
        name: name,
        createdAt: timestamp,
        dockerContentDigest: dockerContentDigest
      })
    } else {
      return image
    }
  })

  var status = checkImage.then(function (image) {
    // If image does not have a id defined and therefore
    // have no way to determine if it has been updated.
    if(!image.dockerContentDigest) {
      image.dockerContentDigest = dockerContentDigest
      return Image.status.UPDATED
    }
    if(image.dockerContentDigest === dockerContentDigest) {
      return Image.status.EXISTS
    } else {
      image.dockerContentDigest = dockerContentDigest
      return Image.status.UPDATED
    }
  })

  var sendToWorker = Promise.all([checkImage, status]).spread(function (image, status) {
    request.log(['info'], 'image status ' + status)
    if(status === Image.status.UPDATED) {
      return Queue.send('image-redeploy', {
        image: image._id
      })
    }
  })

  Promise.all([checkImage, status, sendToWorker]).spread(function (image, status) {
    image.logs.push({
      timestamp: timestamp,
      dockerContentDigest: dockerContentDigest,
      status: status
    })
    image.modifiedAt = timestamp
    return image.save()
  }).then(function() {
    reply("ok")
  }).error(function (err) {
    // Not outputting error on purpose to stop people hitting the API
    // to find active usernames
    request.log(['error'], err)
    reply("ok")
  }).catch(function(err) {
    request.log(['error'], err)
    reply(Boom.badImplementation())
  })
}
