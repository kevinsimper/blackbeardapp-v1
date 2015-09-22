var Reflux = require('reflux')
var request = require('superagent')
var config = require('../../config')
var actions = require('./actions')
var findWhere = require('lodash/collection/findWhere')

var _images = []
var _loaded = false

var store = Reflux.createStore({
  listenables: actions,
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
  },
  initialLoad: function () {
    if(_loaded) return true
    actions.load().then(function () {
      _loaded = true
    })
  },
  getOne: function (id) {
    this.initialLoad()
    var image = findWhere(_images, {
      _id: id
    })
    return image
  }
})

module.exports = store
