require('./shim')

var options = {
  opsInterval: 1000,
  reporters: [
    {
      reporter: require('good-file'),
      events: {log: '*', response: '*', request: '*'},
      config: '/var/log/blackbeard_backend.log'
    }
  ]
}

if(process.env.NODE_ENV === 'development') {
  options.reporters.push({
    reporter: require('good-console'),
    events: {log: '*', response: '*', request: '*'}
  })
}

if (process.env.NODE_ENV === 'production') {
  require('newrelic')

  options.reporters.push({
    reporter: require('good-loggly'),
    events: {log: '*', response: '*', request: '*'},
    config: {
      token: process.env.LOGGLY_TOKEN,
      subdomain: process.env.LOGGLY_SUBDOMAIN
    }
  })
}

var server = require('./server')

server.register({
  register: require('good'),
  options: options
}, function (err) {
  if (err) {
    console.error(err);
  } else {
    server.start(function () {
      console.log('Server running at:', server.info.uri)
    })
  }
})
