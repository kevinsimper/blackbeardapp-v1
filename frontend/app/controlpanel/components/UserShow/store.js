var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')

var _user = {}

var store = Reflux.createStore({
  listenables: actions,
  getUser: function() {
    return _user
  },
  onLoad: function(userId) {
    request.get(config.BACKEND_HOST + '/users/' + userId)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(user) {
    _user = user
    this.trigger(user)
  },
  onDel: function(userId) {
    request.del(config.BACKEND_HOST + '/users/' + userId)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.del.completed(res.body)
      })
  },
  onSave: function(user) {
    request.put(config.BACKEND_HOST + '/users/' + user._id)
      .set('Authorization', localStorage.token)
      .send({
        role: user.role,
        email: user.email,
        credit: user.credit,
        containerLimit: user.containerLimit
      })
      .end(function(err, res) {
        actions.save.completed(res.body)
      })
  },
  onSaveCompleted: function(user) {
    _user = user
    this.trigger(user)
  }
})

module.exports = store
