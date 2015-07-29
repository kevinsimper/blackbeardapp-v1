var options = {}

if(process.env.NODE_ENV === 'production') {
  require('newrelic')

  options = {
    opsInterval: 1000,
    reporters: [{
      reporter: require('good-loggly'),
      events: { log: '*', request: '*'},
      config: {
        token     : process.env.LOGLY_ENV_TOKEN,
        subdomain : process.env.LOGLY_ENV_SUBDOMAIN
      }
    }]
  }
}

var server = require('./server')

server.register({
  register: require('good'),
  options: options
}, function (err) {
  if (err) {
    console.error(err);
  } else {
    server.start(function() {
      console.log('Server running at:', server.info.uri)
    })
  }
})
