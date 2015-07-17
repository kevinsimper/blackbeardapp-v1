if(process.env.NODE_ENV === 'production') {
  require('newrelic')
}

var server = require('./server')

server.start(function() {
  console.log('Server running at:', server.info.uri)
})
