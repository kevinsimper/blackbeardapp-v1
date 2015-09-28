var Promise = require('bluebird')
var RegistryService = require('../services/Registry')
var Image = require('../models/Image')
var User = require('../models/User')
var config = require('../config')
var _ = require('lodash')

exports.getRegistryAllImages = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function(response, reply) {
    var allImages = RegistryService.getAllImages(config.REGISTRY_FULLURL)

    var imageTags = allImages.then(function (allImages) {
      return Promise.map(allImages, function (image) {
        return RegistryService.getOneImage(config.REGISTRY_FULLURL, image)
      })
    }).then(function (data) {
      // Flatten because it should be a collection of objects and not arrays
      return _.flatten(data)
    })
    var imageDetails = imageTags.then(function (imageTags) {
      return Promise.map(imageTags, function (imageTag) {
        return Promise.map(imageTag.tags, function (tag) {
          return RegistryService.getOneTagImageManifest(config.REGISTRY_FULLURL, imageTag.name, tag)
        })
      })
    })

    Promise.all([allImages, imageTags, imageDetails]).spread(function (allImages, imageTags, imageDetails) {
      var combined = imageTags.map(function(image, index) {
        image.tags = imageDetails[index]
        return image
      })
      reply(combined)
    })
  }
}

exports.getSynchronise = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function(response, reply) {
    var allImages = RegistryService.getAllImages(config.REGISTRY_FULLURL)

    var imageTags = allImages.then(function (allImages) {
      return Promise.map(allImages, function (image) {
        return RegistryService.getOneImage(config.REGISTRY_FULLURL, image)
      })
    }).then(function (data) {
      // Flatten because it should be a collection of objects and not arrays
      return _.flatten(data)
    })
    var registryImages = imageTags.then(function (imageTags) {
      return Promise.map(imageTags, function (imageTag) {
        return Promise.map(imageTag.tags, function (tag) {
          return RegistryService.getOneTagImageManifest(config.REGISTRY_FULLURL, imageTag.name, tag)
        })
      })
    })

    var savedImages = Image.find({}).populate('user')

    // Need to update mongo to reflect what is present in registry
    var comparedUsers = Promise.all(Promise.all([registryImages, savedImages]).spread(function(registryImages, savedImages) {
      return _.map(registryImages, function (registryImage) {
        var registryImageName = registryImage[0].name.split('/')
        var username = registryImageName[0]
        var image = registryImageName[1]
        var tag = registryImage[0].tag

        var matchCount = _.size(_.filter(savedImages, function (savedImage) {
          return (savedImage.user.username === username) && (savedImage.name === image)
        }))

        if (matchCount === 0) {
          var user = User.findOne({username: username})
          return user
        }

        return 'matched'
      })
    }))

    Promise.all(Promise.all([registryImages, comparedUsers]).spread(function(registryImages, comparedUsers) {
      return _.map(registryImages, function (registryImage, i) {
        var user = comparedUsers[i]
        if (user !== 'matched') {
          var dockerContentDigest = registryImage[0].dockerContentDigest
          var registryImageName = registryImage[0].name.split('/')
          var name = registryImageName[1]

          var timestamp = Math.round(Date.now() / 1000)

          // Create image
          var image = new Image({
            user: user._id,
            name: name,
            createdAt: timestamp,
            dockerContentDigest: dockerContentDigest,
            logs: [
              {
                timestamp: timestamp,
                dockerContentDigest: dockerContentDigest,
                status: Image.status.EXISTS,
              }
            ]
          })

          return image.save()
        } else {
          return 'okay'
        }
      })
    })).then(function(result) {
      var added = _.filter(result, function(entry) {
        return entry !== 'okay'
      })
      reply({
        count: result.length,
        addedCount: added.length,
        added: added
      })
    })
  }
}
