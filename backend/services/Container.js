var _ = require('lodash')

module.exports = {
  isCurrentlyRunning: function (container) {
    return container.deletedAt === undefined
  }
}
