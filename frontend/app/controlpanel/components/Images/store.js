var Reflux = require('reflux')
var request = require('superagent')
var config = require('../../config')
var actions = require('./actions')
var _images = []

var store = Reflux.createStore({
  listenables: actions,
  init: function() {
    actions.load()
  },
  onLoad: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/users/me/images')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(data) {
    _images = data

    this.trigger(data)
  },
  getImages: function() {
    return _images
  }
})

module.exports = store
