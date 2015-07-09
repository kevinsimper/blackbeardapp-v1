var Reflux = require('reflux')
var request = require('superagent')
var actions = require('./actions')
var config = require('../../config')

var _profile = {
  name: '',
  email: ''
}

var store = Reflux.createStore({
  listenables: actions,
  getProfile: function() {
    return _profile;
  },
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/users/me')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(profile) {
    _profile = profile
    this.trigger(profile)
  },
  onUpdate: function(profile) {
    request.put(config.BACKEND_HOST + '/users/me')
      .set('Authorization', localStorage.token)
      .send({
        name: profile.name,
        email: profile.email
      })
      .end(function(err, res) {
        actions.update.completed(res.body)
      })
  },
  onUpdateCompleted: function(profile) {
    _profile = profile
    this.trigger(profile)
  }
})

module.exports = store
