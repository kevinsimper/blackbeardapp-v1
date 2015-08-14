var Reflux = require('reflux')
var request = require('superagent')
var actions = require('./actions')
var config = require('../../config')

var _logs = []

var store = Reflux.createStore({
  listenables: actions,
  onLoad: function(userId) {
    var self = this
    request
      .get(config.BACKEND_HOST + '/users/' + userId + '/logs')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(logs) {
    _logs = logs
    this.trigger(logs)
  },
  getAll: function () {
    return _logs
  }
})

module.exports = store
