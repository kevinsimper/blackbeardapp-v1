var _ = require('lodash')

module.exports = {
  isCurrentlyRunning: function (app) {
    return (_.size(_.filter(app.containers, function (container) {
      return container.deletedAt === undefined
    })) > 0)
  }
}
