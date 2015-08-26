var Reflux = require('reflux')
var request = require('superagent')
var actions = require('./actions')
var config = require('../../config')

var _payments = []

var store = Reflux.createStore({
  listenables: actions,
  getPayments: function() {
    return _payments;
  },
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/users/me/payments')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        var payments = res

        // Should promisify this
        request.get(config.BACKEND_HOST + '/users/me/vouchers')
        .set('Authorization', localStorage.token)
        .end(function(err, res) {
          console.log(res)
          actions.load.completed(payments)
        })
      })
  },
  onLoadCompleted: function(payments) {
    _payments = payments
    // This breaks
    this.trigger(payments)
  }
})

module.exports = store
