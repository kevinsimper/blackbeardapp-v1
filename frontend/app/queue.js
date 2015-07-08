var request = require('superagent')
var BACKEND_HOST = process.env.BACKEND_HOST;

exports.getNumber = function(email, callback) {
  request.post(BACKEND_HOST + '/queue')
    .send({
      email: email
    })
    .end(callback)
}

exports.setEmail = function(email) {
  window.localStorage.preUserEmail = email
}

exports.getEmail = function(email) {
  return window.localStorage.preUserEmail
}
