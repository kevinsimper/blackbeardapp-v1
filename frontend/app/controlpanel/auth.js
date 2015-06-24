var request = require('superagent')
var config = require('./config')

var auth = {
  login: function(email, pass, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token) {
      if (cb) cb(true);
      auth.onChange(true);
      return;
    }
    makeAuthRequest(email, pass, function(res){
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

function makeAuthRequest(email, password, cb) {
  request
    .post(config.BACKEND_HOST + '/login')
    .send({
      email: email,
      password: password
    })
    .end(function(err, res) {
      if(err) {
        cb({
          authenticated: false
        })
        return false;
      }
      cb({
        authenticated: true,
        token: res.body.token
      })
    })
}

module.exports = auth