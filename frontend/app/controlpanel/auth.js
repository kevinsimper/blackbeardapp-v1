var request = require('superagent')
var config = require('./config')

var auth = {
  login: function(email, pass, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token) {
      if (cb) cb(null, true);
      auth.onChange(true);
      return;
    }
    makeAuthRequest(email, pass, function(err, res){
      if (res.authenticated) {
        localStorage.token = res.token;
        if (cb) cb(null, true);
        auth.onChange(true);
      } else {
        if (cb) {
          cb({
            message: err.message
          }, false);
        }
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
          message: res.body.message
        }, {
          authenticated: false
        })
        return false;
      }
      cb(null, {
        authenticated: true,
        token: res.body.token
      })
    })
}

module.exports = auth