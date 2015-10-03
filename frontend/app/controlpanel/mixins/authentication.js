var auth = require('../auth')

var Authentication = {
  statics: {
    willTransitionTo: function (transition) {
      if (!auth.loggedIn()) {
        transition.redirect('/controlpanel/login', {}, {'nextPath' : transition.path});
      }
    }
  }
};

module.exports = Authentication;
