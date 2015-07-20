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
         /*
         proxy_set_header Host $host;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-Proto $scheme;
         proxy_set_header X-Original-URI $request_uri;
         proxy_set_header Docker-Distribution-Api-Version registry/2.0;
       
         location / {
           auth_basic "Restricted";
           auth_basic_user_file /etc/nginx/.htpasswd;
           proxy_pass http://docker-registry:5000;
         }
         */
        var requestUri = 'http://' + ip.trim() + ':5000/'+request.url.href
        return reply.proxy({
          mapUri:  function (request, callback) {
            requestUri = 'http://blackbeard.io'
            callback(false, requestUri, {Testingheader: '123'})
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
