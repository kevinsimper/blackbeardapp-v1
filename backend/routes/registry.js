var RegistryService = require('../services/Registry')
var config = require('../config')

exports.getRegistryAllImages = {
  auth: 'jwt',
  app: {
    level: 'ADMIN'
  },
  handler: function(response, reply) {
    RegistryService.getAllImages(config.REGISTRY_FULLURL).then(function (allImages) {
      reply(allImages)
    })
  }
}
