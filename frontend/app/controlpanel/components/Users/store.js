var Reflux = require('reflux')
var Actions = require('./actions')
var request = require('superagent')
var config = require('../../config')

_users = []

var Store = Reflux.createStore({
  listenables: Actions,
  getUsers: function() {
    return _users
  },
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/users')
    .set('Authorization', localStorage.token)
    .end(function(err, res) {
      Actions.load.completed(res.body)
    })
  },
  onLoadCompleted: function(users) {
    _users = users
    this.trigger(users)
  }
})

module.exports = Store
