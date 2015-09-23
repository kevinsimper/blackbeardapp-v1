var Reflux = require('reflux')
var request = require('superagent')
var actions = require('./actions')
var config = require('../../config')
var once = require('lodash/function/once')

var _profile = {
  name: '',
  email: '',
  verificationSendStatus: ''
}

var startIntercom = once(function (profile) {
  if(!window.Intercom) {
    return false
  }
  var intercomSettings = {
    email: profile.email,
    created_at: profile.timestamp,
    user_id: profile._id
  }
  if(profile.name) {
    intercomSettings.name = profile.name
  }
  Intercom('update', intercomSettings)
})

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

    startIntercom(profile)
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
  },
  onVerifyUserEmail: function() {
    request.get(config.BACKEND_HOST + '/users/me/verifysend')
      .set('Authorization', localStorage.token)
      .send()
      .end(function(err, res) {
        if (res.status === 200) {
          actions.verifyUserEmail.completed(res.body)
        } else {
          actions.verifyUserEmail.failed(err)
        }
      })
  },
  onVerifyUserEmailCompleted: function(result) {
    _profile.verificationSendStatus = true

    this.trigger(_profile)
  },
  onVerifyUserEmailFailed: function(result) {
    _profile.verificationSendStatus = false

    this.trigger(_profile)
  }
})

module.exports = store
