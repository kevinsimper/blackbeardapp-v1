var Hapi = require('hapi')
var fs = require('fs')
var req = require('request')
var server = new Hapi.Server()
var child_process = require('child_process')

server.connection({
  port: '9500',
  tls: {
    key: fs.readFileSync(__dirname + '/registry.blackbeard.dev.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/registry.blackbeard.dev.crt', 'utf8')
  }
})

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

server.route({
  method: '*',
  path: '/{p*}',
  config: {
    handler: function(request, reply) {
      var url = 'http://' + ip.trim() + ':5000/v2/'
      return reply.proxy({
        uri: url,
        passThrough: true
      })
    },
    payload: {
      output: 'stream',
      parse: false
    }
  }
})

module.exports = server
