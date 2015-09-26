var Promise = require('bluebird')
var RegistryService = require('../services/Registry')
var Image = require('../models/Image')
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
      return Promise.all(allImages.map(function (image) {
        return RegistryService.getOneImage(config.REGISTRY_FULLURL, image)
      }))
    }).then(function (data) {
      // Flatten because it should be a collection of objects and not arrays
      return _.flatten(data)
    })
    var registryImages = imageTags.then(function (imageTags) {
      return Promise.all(imageTags.map(function (imageTag) {
        return Promise.all(imageTag.tags.map(function (tag) {
          return RegistryService.getOneTagImageManifest(config.REGISTRY_FULLURL, imageTag.name, tag)
        }))
      }))
    })

    var savedImages = Image.find({}).populate('user')

    // Assuming here if it is present on the registry but not in our database we don't want it
    // GETing can be a tag or digest but DELETEing  you have to give a digest
    // TODO: Find out how to generate a digest
    Promise.all([registryImages, savedImages]).spread(function(registryImages, savedImages) {
      // _.map(registryImages, function (registryImage) {

      //   var registryImageName = registryImage[0].name.split('/')
      //   var username = registryImageName[0]
      //   var image = registryImageName[1]
      //   var tag = registryImage[0].tag

      //   var matching = _.filter(savedImages, function (savedImage) {
      //     return (savedImage.user.username === username) && (savedImage.name === image)
      //   })

      //   if (!matching.length) {
      //     // None match so delete from registry
      //     return RegistryService.deleteOneTagImageManifest(config.REGISTRY_FULLURL, registryImage[0].name, tag)
      //   }
      // })
    })
  }
}
