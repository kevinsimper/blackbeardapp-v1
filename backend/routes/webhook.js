var Image = require('../models/Image')

exports.postNotifyImage = function(request, reply) {
  var user = request.payload.user
  var name = request.payload.name

  var image = new Image({
    user: user,
    name: name,
    createdAt: Math.round(Date.now() / 1000),
    modifiedAt: Math.round(Date.now() / 1000)
  })
  image.save(function(err, savedImage) {
    reply('ok')
  })
}
