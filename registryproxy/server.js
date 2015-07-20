var Hapi = require('hapi')
var fs = require('fs')
var req = require('request')
var server = new Hapi.Server()
var child_process = require('child_process')
var debug = require('debug')('proxy')
var Boom = require('boom')

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

var validate = function(request, username, password, callback) {
  debug('Validating request', request.url.path, request.headers)
  // If dev then do fake response
  if (process.env.NODE_ENV != 'production') {
    debug('Fake username/password')
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



server.ext('onRequest', function(request, reply) {
  debug('URL', request.url.path)
  debug('Authorization token', request.headers.authorization)
  return reply.continue()
})

// server.route({
//   method: 'GET',
//   path: '/v2/',
//   config: {
//     auth: false,
//     handler: function(request, reply) {
//       debug('V2 Request')
//       reply({})
//     }
//   }
// })

server.route({
  method: '*',
  path: '/v1/{p*}',
  config: {
    handler: function(request, reply) {
      reply().code(404).header('Docker-Distribution-API-Version', 'registry/2.0')
    }
  }
})


server.route({
  method: '*',
  path: '/{p*}',
  config: {
    handler: function(request, reply) {
      debug('Request Headers', request.url.path, request.headers)

      var req = request.raw.req;
      var authorization = req.headers.authorization;
      if (!authorization) {
        console.log('boom unauthorized 0')
        return reply().code(401).header('WWW-Authenticate', 'Basic').header('Docker-Distribution-API-Version', 'registry/2.0')

      }

      var parts = authorization.split(/\s+/);

      if (parts[0].toLowerCase() !== 'basic') {
        console.log('boom unauthorized 1')
        return reply(Boom.unauthorized(null, 'Basic'));
      }

      if (parts.length !== 2) {
        console.log('boom unauthorized 2')
        return reply(Boom.badRequest('Bad HTTP authentication header format', 'Basic'));
      }

      var credentialsPart = new Buffer(parts[1], 'base64').toString();
      var sep = credentialsPart.indexOf(':');
      if (sep === -1) {
        console.log('boom unauthorized 3')
        return reply(Boom.badRequest('Bad header internal syntax', 'Basic'));
      }

      var username = credentialsPart.slice(0, sep);
      var password = credentialsPart.slice(sep + 1);

      if (!username && !settings.allowEmptyUsername) {
        console.log('boom unauthorized 4')
        return reply(Boom.unauthorized('HTTP authentication header missing username', 'Basic'));
      }
      console.log('USER validationFunc')

      validate(request, username, password, function(err, isValid, credentials) {
        debug('isValid', isValid)

        credentials = credentials || null;

        if (err) {
          return reply(err, null, {
            credentials: credentials
          });
        }

        if (!isValid) {
          return reply(Boom.unauthorized('Bad username or password', 'Basic'), null, {
            credentials: credentials
          });
        }

        if (!credentials ||
          typeof credentials !== 'object') {

          return reply(Boom.badImplementation('Bad credentials object received for Basic auth validation'));
        }

        // Authenticated

        if (request.url.path.indexOf('v1') !== -1) {
          debug('V1 request', request.url.path, 404)
          return reply().code(404)
        }
        var url = 'http://' + ip.trim() + ':5000' + request.url.href
        console.log('URLLLL', url)
        return reply.proxy({
          uri: url
        })
      });


    },
    payload: {
      output: 'stream',
      parse: false
    }
  }
})

server.ext('onPostHandler', function(request, reply) {
  debug('Reply headers', reply.request.response.headers)
  debug('Reply statusCode', reply.request.response.statusCode)
  return reply.continue();
})



module.exports = server
