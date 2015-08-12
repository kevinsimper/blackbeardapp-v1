var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')
var remove = require('lodash/array/remove')

var _logs = {}

var store = Reflux.createStore({
  listenables: actions,
  init: function() {},
  onLoadOne: function(app) {
    if (app) {
      var self = this
      request
        .get(config.BACKEND_HOST + '/users/me/apps/' + app + '/logs')
        .set('Authorization', localStorage.token)
        .end(function (err, res) {
          actions.loadOne.completed(app, res.body)
        })
    }
  },
  onLoadOneCompleted: function(app, data) {
    _logs[app] = data

    this.trigger(data)
  },
  getOne: function(app) {
    if (!_logs[app]) {
      return []
    } else {
      return _logs[app];
    }
  }
})

module.exports = store
