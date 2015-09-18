var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')
var remove = require('lodash/array/remove')

var _billing = {results: [], monthTotals: {}}

var store = Reflux.createStore({
  listenables: actions,
  init: function() {},
  onLoadOne: function() {
    var self = this
    request
      .get(config.BACKEND_HOST + '/users/me/billing')
      .set('Authorization', localStorage.token)
      .end(function (err, res) {
        actions.loadOne.completed(res.body)
      })
  },
  onLoadOneCompleted: function(data) {
    _billing = data
    this.trigger(data)
  },
  getBilling: function() {
    return _billing
  }
})

module.exports = store
