var Reflux = require('reflux')
var request = require('superagent')
var config = require('../../config')
var actions = require('./actions')
var _billing = {}

module.exports = Reflux.createStore({
  listenables: actions,
  init: function() {},
  onLoadOne: function(month) {
    var self = this
    request
      .get(config.BACKEND_HOST + '/users/me/billing/' + month)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.loadOne.completed(month, res.body)
      })
  },
  onLoadOneCompleted: function(month, data) {
    _billing[month] = data

    this.trigger(data)
  },
  getOne: function(month) {
    if (!_billing[month]) {
      return []
    } else {
      return _billing[month];
    }
  },
})
