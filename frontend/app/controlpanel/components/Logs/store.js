var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')

var _logs = []

var store = Reflux.createStore({
  listenables: actions,
  onLoad: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/logs')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(logs) {
    _logs = logs
    this.trigger(logs)
  },
  getAll: function() {
    return _logs
  }
})

module.exports = store
