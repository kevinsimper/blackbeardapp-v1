var Reflux = require('reflux')
var actions = require('./Actions')
var request = require('superagent')
var config = require('../../config')

var _apps = []

var AppStore = Reflux.createStore({
  listenables: actions,
  onLoad: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/app')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(data) {
    _apps = data
    this.trigger(data)
  },
  onNew: function(app) {
    request
      .post(config.BACKEND_HOST + '/app')
      .set('Authorization', localStorage.token)
      .send({
        name: app.name
      })
      .end(function(err, res) {
        actions.new.completed(res.body)
      })
  },
  onNewCompleted: function(data) {
    _apps.push(data)
    this.trigger(data)
  },
  getApps: function() {
    return _apps;
  }
})

module.exports = AppStore