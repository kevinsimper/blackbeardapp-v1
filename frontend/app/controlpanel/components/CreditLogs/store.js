var Reflux = require('reflux')
var request = require('superagent')
var actions = require('./actions')
var config = require('../../config')
var _ = require('lodash')

var _creditLogs = []

var store = Reflux.createStore({
  listenables: actions,
  getCreditLogs: function() {
    return _creditLogs;
  },
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/creditlogs')
    .set('Authorization', localStorage.token)
    .end(function(err, res) {
      console.log(res)
      actions.load.completed(res.body)
    })
  },
  onLoadCompleted: function(creditLogs) {
    _creditLogs = creditLogs
    this.trigger(creditLogs)
  }
})

module.exports = store
