var auth = require('../auth')

var Authentication = {
  statics: {
    willTransitionTo: function (transition) {
      if (!auth.loggedIn()) {
      }
    }
  }
};

module.exports = Authentication;
