var Reflux = require('reflux')
var request = require('superagent')
var Actions = require('./actions')
var config = require('../../config')

var _creditCards = []

var Store = Reflux.createStore({
  listenables: Actions,
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/user/me/creditcards')
    .set('Authorization', localStorage.token)
    .end(function(err, res) {
      Actions.load.completed(res.body)
    })
  },
  onLoadCompleted: function(data) {
    _creditCards = data
    this.trigger(data)
  },
  getCreditCards: function() {
    return _creditCards
  }
})

module.exports = Store
