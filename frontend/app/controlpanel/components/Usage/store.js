var Reflux = require('reflux')
var actions = require('./actions')
var request = require('superagent')
var config = require('../../config')
var findWhere = require('lodash/collection/findWhere')
var remove = require('lodash/array/remove')

var _billing = {}

var store = Reflux.createStore({
  listenables: actions,
  init: function() {},
  onLoadOne: function(month) {
    if (month) {
      var self = this
      request
        .get(config.BACKEND_HOST + '/users/me/billing/' + month)
        .set('Authorization', localStorage.token)
        .end(function (err, res) {
          actions.loadOne.completed(month, res.body)
        })
    }
  },
  onLoadOneCompleted: function(month, data) {
    _billing[month] = data
    this.trigger(data)
  },
  getOne: function(month) {
    console.log("MONTH", month)
    if (!_billing[month]) {
      return []
    } else {
      return _billing[month];
    }
  }
})

module.exports = store
