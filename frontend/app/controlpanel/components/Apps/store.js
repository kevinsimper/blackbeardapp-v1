var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')
var remove = require('lodash/array/remove')

var _apps = []
var _loaded = false

var store = Reflux.createStore({
  listenables: actions,
  initialLoad: function () {
    if(_loaded) return true
    actions.load().then(function () {
      _loaded = true
    })
  },
  onLoad: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/users/me/apps')
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
      .post(config.BACKEND_HOST + '/users/me/apps')
      .set('Authorization', localStorage.token)
      .send({
        name: app.name,
        image: app.image
      })
      .end(function(err, res) {
        if (err) {
          actions.new.failed(res.body)
        } else {
          actions.new.completed(res.body)
        }
      })
  },
  onNewCompleted: function(data) {
    _apps.push(data)
    this.trigger(data)
  },
  onNewFailed: function(data) {
    this.trigger(_apps)
  },
  getApps: function() {
    this.initialLoad()
    return _apps;
  },
  getOneApp: function(id) {
    return findWhere(_apps, {_id: id})
  },
  onDel: function(id) {
    request
      .del(config.BACKEND_HOST + '/users/me/apps/' + id)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.del.completed()
      })
  },
  onNewContainer: function(id, container) {
    request
      .post(config.BACKEND_HOST + '/users/me/apps/' + id + '/containers')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        if(err) {
          return actions.newContainer.failed(err)
        }
        actions.newContainer.completed(id, res.body)
      })
  },
  onNewContainerCompleted: function(id, container) {
    var app = this.getOneApp(id)
    if(!app) {
      location = '#/apps/' + id
    }
    if(app.containers) {
      app.containers.push(container)
    } else {
      app.containers = [container]
    }
    this.trigger(container)
  }
})

module.exports = store
