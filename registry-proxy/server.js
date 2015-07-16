var Hapi = require('hapi')
var fs = require('fs')
var req = require('request')
var server = new Hapi.Server()

server.connection({
  port: '9500',
  tls: {
    key: fs.readFileSync(__dirname + '/registry.blackbeard.dev.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/registry.blackbeard.dev.crt', 'utf8')
  }
})

server.route({
  method: '*',
  path: '/{p*}',
  config: {
    handler: function(request, reply) {
      return reply.proxy({
        host: 'www.kevinsimper.dk',
        port: 80,
        protocol: 'http'
      })
    },
    payload: {
      output: 'stream',
      parse: false
    }
  }
})

module.exports = server
