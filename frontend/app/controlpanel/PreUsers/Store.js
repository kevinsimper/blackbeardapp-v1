var Reflux = require('reflux')
var request = require('superagent')
var config = require('../config')
var actions = require('./Actions')
var _ = require('lodash')

var _preUsers = []

var Store = Reflux.createStore({
  listenables: actions,
  onLoad: function() {
    request
      .get(config.BACKEND_HOST + '/preusers', function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(data) {
    _preUsers = data
    this.trigger(data)
  },
  getPreUsers: function() {
    return _preUsers
  },
  onDel: function(id) {
    _.remove(_preUsers, function(item) {
      return item._id === id
    })
    this.trigger()
    
    request
      .del(config.BACKEND_HOST + '/preusers/' + id, function(err, res) {
        actions.del.completed()
      })
  },
  onDelCompleted: function() {
    
  }
})

module.exports = Store