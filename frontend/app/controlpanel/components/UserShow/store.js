var Reflux = require('Reflux')
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
  }
})

module.exports = store
