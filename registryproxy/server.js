var Hapi = require('hapi')
var fs = require('fs')
var req = require('request')
var server = new Hapi.Server()
var child_process = require('child_process')
var debug = require('debug')('proxy')

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
  // If dev then do fake response
  if (process.env.NODE_ENV != 'production') {
    if (username === 'blackbeard' && password === 'password') {
      return callback(null, true, {
          message: 'Login successful.',
          token: 'token'
        });
    } else {
      return callback(null, false, false);
    }
  } else {
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
        return callback(null, (body.statusCode == 300), body);
      })
  }
};

server.register(require('hapi-auth-basic'), function (err) {
  server.auth.strategy('simple', 'basic', { validateFunc: validate });
  server.route({
    method: 'GET',
    path: '/v1/_ping',
    config: {
      auth: false,
      handler: function(request, reply) {
        reply('V2 registry')
      }
    }
  })
  server.route({
    method: '*',
    path: '/{p*}',
    config: {
      auth: 'simple',
      handler: function(request, reply) {
        var requestUri = 'http://' + ip.trim() + ':5000/'+request.url.href
        var proxyReq = {
          'Host': ip.trim() + ':5000',
          'X-Forwarded-For': request.info.remoteAddress,
          'X-Real-IP': ip.trim(),
          'X-Forwarded-Proto': 'http',
          'X-Original-URI': request.headers.host+request.url.path,
          'Docker-Distribution-Api-Version': 'registry/2.0'
        }
        return reply.proxy({
          mapUri:  function (request, callback) {
            callback(false, requestUri, proxyReq)
          }
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
