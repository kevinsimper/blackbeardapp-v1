var Reflux = require('reflux')
var actions = require('./Actions')
var request = require('superagent')
var config = require('../../config')

var _apps = [{
    id: 1,
    name: 'awesome-app'
  }, {
    id: 2,
    name: 'docker-fun'
  }]

var AppStore = Reflux.createStore({
  listenables: actions,
  onNew: function(app) {
    _apps.push(app)
    this.trigger()
    request
      .post(config.BACKEND_HOST + '/app')
      .set('Authorization', localStorage.token)
      .send({
        name: app.name
      })
      .end(function(err, res) {
        actions.new.completed()
      })
  },
  getApps: function() {
    return _apps;
  }
})

module.exports = AppStore