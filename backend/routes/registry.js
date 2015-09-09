var Promise = require('bluebird')
var RegistryService = require('../services/Registry')
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
      return Promise.all(allImages.map(function (image) {
        return RegistryService.getOneImage(config.REGISTRY_FULLURL, image)
      }))
    }).then(function (data) {
      // Flatten because it should be a collection of objects and not arrays
      return _.flatten(data)
    })
    var imageDetails = imageTags.then(function (imageTags) {
      return Promise.all(imageTags.map(function (imageTag) {
        return Promise.all(imageTag.tags.map(function (tag) {
          return RegistryService.getOneTagImageManifest(config.REGISTRY_FULLURL, imageTag.name, tag)
        }))
      }))
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
