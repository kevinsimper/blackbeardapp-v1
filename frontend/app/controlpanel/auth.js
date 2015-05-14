var auth = {
  login: function(email, pass, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token) {
      if (cb) cb(true);
      auth.onChange(true);
      return;
    }
    pretendRequest(email, pass, function(res){
      if (res.authenticated) {
        localStorage.token = res.token;
        if (cb) cb(true);
        auth.onChange(true);
      } else {
        if (cb) cb(false);
        auth.onChange(false);
      }
    });
  },
  getToken: function () {
    return localStorage.token;
  },

  logout: function (cb) {
    delete localStorage.token;
    auth.onChange(false);
  },

  loggedIn: function () {
    return !!localStorage.token;
  },

  onChange: function () {}
};

function pretendRequest(email, pass, cb) {
  setTimeout(function() {
    if (email === 'joe@example.com' && pass === 'password1') {
      cb({
        authenticated: true,
        token: Math.random().toString(36).substring(7)
      });
    } else {
      cb({
        authenticated: true,
        token: Math.random().toString(36).substring(7)
      });
    }
  }, 1000);
}

module.exports = auth