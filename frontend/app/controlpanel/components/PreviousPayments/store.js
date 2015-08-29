var Reflux = require('reflux')
var request = require('superagent')
var actions = require('./actions')
var config = require('../../config')
var _ = require('lodash')

var _payments = []

var store = Reflux.createStore({
  listenables: actions,
  getPayments: function() {
    return _payments;
  },
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/users/me/creditlogs')
    .set('Authorization', localStorage.token)
    .end(function(err, res) {
      console.log(res)
      actions.load.completed(res.body)
    })
  },
  onLoadCompleted: function(payments) {
    _payments = payments
    this.trigger(payments)
  }
})

module.exports = store
