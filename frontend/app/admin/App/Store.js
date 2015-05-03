var Reflux = require('reflux')
var actions = require('./Actions')

var apps = [{name: 'awesome-app'}, {name: 'docker-fun'}]

var AppStore = Reflux.createStore({
  listenables: actions,
  onCreateApp: function(app) {
    apps.push(app)
    this.trigger()
  },
  getApps: function() {
    return apps;
  }
})

module.exports = AppStore