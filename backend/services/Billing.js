var Promise = require('bluebird')
var moment = require('moment')
var App = Promise.promisifyAll(require('../models/App'))
var _ = require('lodash')

module.exports = {
  diffHours: function(a, b) {
    return Math.ceil(a.diff(b, 'minute')/60.0)
  },
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
              hours += self.diffHours(deletedAt, start)
            } else {
              hours += self.diffHours(deletedAt, createdDate)
            }
          } else {
            // Stopped after end of month
            if (createdDate.isBefore(start)) {
              hours += self.diffHours(end, start)
            } else {
              hours += self.diffHours(end, createdDate)
            }
          }
        }
      })

      resolve(hours)
    })
  },
  getUserAppsBillableHours: function(user, start, end) {
    var self = this
    return new Promise(function (resolve, reject) {
      var apps = App.find({user: user}).populate('containers')

      var bill = []

      apps.then(function(actualApps) {
        _.each(actualApps, function (app) {
          var hours = 0

          app.containers.forEach(function (container, i) {
            var createdDate = moment.unix(container.createdAt)

            var deletedAt = moment()
            if (container.deletedAt) {
              var deletedAt = moment(container.deletedAt)
            }

            if (!deletedAt.isBefore(start)) {
              if (deletedAt.isBefore(end)) {
                // Stopped within month
                if (createdDate.isBefore(start)) {
                  hours += self.diffHours(deletedAt, start)
                } else {
                  hours += self.diffHours(deletedAt, createdDate)
                }
              } else {
                // Stopped after end of month
                if (createdDate.isBefore(start)) {
                  hours += self.diffHours(end, start)
                } else {
                  hours += self.diffHours(end, createdDate)
                }
              }
            }
          })

          bill.push({
            appName: app.name,
            appId: app._id,
            hours: hours
          })
        })

        resolve(bill)
      }).catch(function (err) {
        request.log(err)
        return reply(Boom.badImplementation('There was a problem with the database.'))
      })
    })
  }
}
