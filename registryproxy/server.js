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

var validate = function (request, username, password, callback) {
  req({
      method: 'POST',
      uri: 'http://' + ip.trim() + ':8000/login',
      json: true,
      body: {
        email: username,
        password: password
      }
    },
    function(error, response, body) {
      if (error) {
        return callback(error, false);
      }
      return callback(error, true, body);
    })
};

server.register(require('hapi-auth-basic'), function (err) {
  server.auth.strategy('simple', 'basic', { validateFunc: validate });
  server.route({
    method: '*',
    path: '/{p*}',
    config: {
      auth: 'simple',
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
  });
});

module.exports = server
