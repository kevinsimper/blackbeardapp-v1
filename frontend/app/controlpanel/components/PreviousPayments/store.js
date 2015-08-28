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
    var combined = []
    request.get(config.BACKEND_HOST + '/users/me/payments')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        _.each(res.body, function(payment) {
          combined.push({
            timestamp: payment.timestamp,
            amount: payment.amount,
            status: payment.status,
            source: 'Credit Card'
          })
        })

        // Should promisify this
        request.get(config.BACKEND_HOST + '/users/me/vouchers')
        .set('Authorization', localStorage.token)
        .end(function(err, res) {
          _.each(res.body, function(voucherPayment) {
            combined.push({
              timestamp: voucherPayment.claimedAt,
              amount: voucherPayment.voucher.amount,
              status: 'SUCCESS',
              source: 'Voucher'
            })
          })

          actions.load.completed(combined)
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
