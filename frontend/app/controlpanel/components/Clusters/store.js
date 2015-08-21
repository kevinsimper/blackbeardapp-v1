var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')

var _clusters = []

var store = Reflux.createStore({
  listenables: actions,
  onLoad: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/clusters')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(clusters) {
    _clusters = clusters
    this.trigger(clusters)
  },
  getAll: function () {
    return _clusters
  },
  getOne: function (id) {
    var one = findWhere(_clusters, {_id: id})
    return (typeof one === 'undefined') ? {} : one
  }
})

module.exports = store
