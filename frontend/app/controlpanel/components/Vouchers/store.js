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
      .get(config.BACKEND_HOST + '/admin/vouchers')
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
  }
})

module.exports = store
