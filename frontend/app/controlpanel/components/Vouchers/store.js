var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')
var remove = require('lodash/array/remove')

var _vouchers = []

var store = Reflux.createStore({
  listenables: actions,
  onLoad: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/vouchers')
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        actions.load.completed(res.body)
      })
  },
  onLoadCompleted: function(vouchers) {
    _vouchers = vouchers
    this.trigger(vouchers)
  },
  getAll: function () {
    return _vouchers
  },
  getOne: function (id) {
    var one = findWhere(_vouchers, {_id: id})
    return (typeof one === 'undefined') ? {} : one
  },
  onNew: function(voucher) {
    var data = {}
    data.amount = voucher.amount
    data.limit = voucher.limit
    if (voucher.email) {
      data.email = voucher.email
    }
    if (voucher.note) {
      data.note = voucher.note
    }
    request
      .post(config.BACKEND_HOST + '/vouchers')
      .set('Authorization', localStorage.token)
      .send(data)
      .end(function(err, res) {
        actions.new.completed(res.body)
      })
  },
  onNewCompleted: function(data) {
    _vouchers.push(data)
    this.trigger(data)
  },
})

module.exports = store
