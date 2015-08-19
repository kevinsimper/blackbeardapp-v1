var _ = require('lodash')
var moment = require('moment')
var Promise = require('bluebird')
var App = Promise.promisifyAll(require('../models/App'))
var Container = require('../models/Container')

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
      var bill = []

      var apps
      if ((user.username === 'billing_test') && (user.email === 'test@blackbeard.io')) {
        // Mocking stuff out - this could be improved
        apps = new Promise(function(resolve) {
          var app = new App({name: "testAppBilling"})
          var appObj = app.toObject()
          appObj.containers = [
            new Container({createdAt: moment('2015-07-24 18:31:12').unix(), deletedAt: '2015-08-24 18:01:12'})
          ]
          var appObj2 = app.toObject()
          appObj2.containers = [
            new Container({createdAt: moment('2015-08-28 01:31:12').unix(), deletedAt: '2015-08-29 01:01:12'})
          ]

          resolve([appObj, appObj2]);
        })
      } else {
        apps = App.find({user: user}).populate('containers')
      }

      apps.then(function(actualApps) {
        var totalHours = 0
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

          if (hours) {
            bill.push({
              appName: app.name,
              appId: app._id,
              hours: hours
            })

            totalHours += hours
          }
        })

        resolve({apps: bill, total: totalHours})
      }).catch(function (err) {
        request.log(err)
        return reply(Boom.badImplementation('There was a problem with the database.'))
      })
    })
  }
}
