require('./shim')

var options = {
  opsInterval: 1000,
  reporters: [
    // {
    //   reporter: require('good-file'),
    //   events: {log: '*', response: '*', request: '*'},
    //   config: '/var/log/blackbeard_backend.log'
    // },
    // {
    //   reporter: require('good-console'),
    //   events: {log: '*', response: '*', request: '*'}
    // }
  ]
}

var server = require('./server')

var debug = false
if(debug || process.env.DEBUG === 'true') {
  server._settings.debug.request.push('info', 'error', 'mongo')
}

server.register({
  register: require('good'),
  options: options
}, function () {
  module.exports = function () {
    server.start(function () {
      console.log('Server running at:', server.info.uri)
    })
  }
})
