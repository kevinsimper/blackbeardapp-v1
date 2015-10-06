var Reflux = require('reflux')
var actions = require('./actions')
var request = require('../../Utils/request')

var _billings = {}

var UsageDailyStore = Reflux.createStore({
  listenables: actions,
  getAll: function () {
    return _billings
  },
  onLoadOne: function (appId) {
    request.get('/users/me/apps/' + appId + '/billing')
      .end(function (err, res) {
        actions.loadOne.completed(appId, res.body)
      })
  },
  onLoadOneCompleted: function (appId, body) {
    _billings[appId] = body
    this.trigger(appId, body)
  }
})

module.exports = UsageDailyStore
