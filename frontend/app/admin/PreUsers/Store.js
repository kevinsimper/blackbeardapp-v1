var Reflux = require('reflux')
var request = require('superagent')
var config = require('../config')
var actions = require('./actions')

var _preUsers = []

var Store = Reflux.createStore({
  listenables: actions,
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/preusers', function(err, res) {
      actions.load.completed(res.body)
    })
  },
  onLoadCompleted: function(data) {
    _preUsers = data
    this.trigger(data)
  },
  getPreUsers: function() {
    return _preUsers
  }
})

module.exports = Store