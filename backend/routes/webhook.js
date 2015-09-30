var Promise = require('bluebird')
var Image = require('../models/Image')
var User = require('../models/User')
var RegistryService = require('../services/Registry')
var System = require('../models/System')
var Boom = require('boom')
var Queue = require('../services/Queue')
var _ = require('lodash')

var config = require('../config')

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

  var image = user.then(function() {
    return Image.findOne({ name: name })
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

  // Set ports on image document
  var registryImage = RegistryService.getOneImage(config.REGISTRY_FULLURL, username + "/" + name)
  var exposedPorts = registryImage.then(function(registryImage) {
    return Promise.map(registryImage.tags, function (tag) {
      return RegistryService.getOneTagImageManifest(config.REGISTRY_FULLURL, registryImage.name, tag)
    })
  }).then(function(imageManifests) {
    return RegistryService.extractPortsFromTagImageManifest(imageManifests)
  }).catch(function(err) {
    // In the situation we cannot retrieve the TagImageManifest from the RegistryService we will just return an
    // empty list. It will basically mean the image does not have ports exposed or is corrupt in some way.
    return []
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

  Promise.all([checkImage, status, exposedPorts, sendToWorker]).spread(function (image, status, exposedPorts) {
    image.logs.push({
      timestamp: timestamp,
      dockerContentDigest: dockerContentDigest,
      status: status
    })
    image.modifiedAt = timestamp
    image.exposedPorts = exposedPorts

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
