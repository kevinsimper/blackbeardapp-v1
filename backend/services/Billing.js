var Promise = require('bluebird')
var moment = require('moment')

module.exports = {
  getAppBillableHours: function(app, start, end) {
    var self = this
    return new Promise(function (resolve, reject) {
      var hours = 0
      app.containers.forEach(function(container, i) {
        var createdDate = moment.unix(container.createdAt)

        var deletedAt = moment()
        if (container.deletedAt) {
          var deletedAt = moment(container.deletedAt)
        }

        if (!deletedAt.isBefore(start)) {
          if (deletedAt.isBefore(end)) {
            // Stopped within month
            if (createdDate.isBefore(start)) {
              hours += deletedAt.diff(start, 'hour')
            } else {
              hours += deletedAt.diff(createdDate, 'hour')
            }
          } else {
            // Stopped after end of month
            if (createdDate.isBefore(start)) {
              hours += end.diff(start, 'hour')
            } else {
              hours += end.diff(createdDate, 'hour')
            }
          }
        }
      })

      resolve(hours)
    })
  }
}
