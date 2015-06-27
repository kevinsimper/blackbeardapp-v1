var Reflux = require('reflux')

var actions = Reflux.createActions({
  'load': {
    children: ['completed', 'failed']
  },
  'changeName': {},
  'changeEmail': {}
})

var _profile = {
  name: 'Kevin Simper',
  email: 'kevin.simper@gmail.com'
}

var store = Reflux.createStore({
  listenables: actions,
  getProfile: function() {
    return _profile;
  }
})

module.exports = store