var Reflux = require('reflux')
var request = require('superagent')
var Actions = require('./actions')
var config = require('../../config')
var remove = require('lodash/array/remove')

var _creditCards = []

var Store = Reflux.createStore({
  listenables: Actions,
  onLoad: function() {
    request.get(config.BACKEND_HOST + '/users/me/creditcards')
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
  },
  onNew: function(item) {
    request.post(config.BACKEND_HOST + '/users/me/creditcards')
    .set('Authorization', localStorage.token)
    .send({
      name: item.name,
      creditcard: item.creditcard,
      expiryMonth: item.expiryMonth,
      expiryYear: item.expiryYear,
      cvv: item.cvv
    })
    .end(function(err, res) {
      if(err) {
        return Actions.new.failed()
      }
      Actions.new.completed(res.body)
    }) 
  },
  onNewCompleted: function(item) {
    _creditCards.push(item)
    this.trigger(item)
  },
  onDel: function(creditcardName) {
    remove(_creditCards, function(item) {
      return creditcardName === item.name
    })
    this.trigger()
    request.del(config.BACKEND_HOST + '/users/me/creditcards/' + creditcardName)
    .set('Authorization', localStorage.token)
    .end(function(err, res) {
      Actions.del.completed()
    })
  }
})

module.exports = Store
