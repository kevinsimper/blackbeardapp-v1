var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')
var reduce = require('lodash/collection/reduce')
var filter = require('lodash/collection/filter')
var remove = require('lodash/array/remove')

var _containers = {}

var store = Reflux.createStore({
  listenables: actions,
  init: function() {},
  onLoadOne: function(app) {
    if (app) {
      var self = this
      request
        .get(config.BACKEND_HOST + '/users/me/apps/' + app + '/containers')
        .set('Authorization', localStorage.token)
        .end(function (err, res) {
          actions.loadOne.completed(app, res.body)
        })
    }
  },
  onLoadOneCompleted: function(app, data) {
    _containers[app] = data
    this.trigger(data)
  },
  getOne: function(app) {
    if (!_containers[app]) {
      return []
    } else {
      return _containers[app];
    }
  },
  getAll: function () {
    return _containers
  },
  getAllActive: function () {
    var activeContainers = reduce(_containers, function (result, container, app) {
      result[app] = filter(container, {deleted: false})
      return result
    }, {})
    return activeContainers
  },
  onDelOne: function(app, container) {
    remove(_containers[app], function(item) {
      return item._id === container
    })
    this.trigger()
    request
      .del(config.BACKEND_HOST + '/users/me/apps/' + app + '/containers/' + container)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        if(err) {
          return actions.delOne.failed(err)
        }
        actions.delOne.completed(app, container)
      })
  }
})

module.exports = store
