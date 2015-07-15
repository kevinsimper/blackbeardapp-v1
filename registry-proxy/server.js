var Hapi = require('hapi')
var Fs = require('fs')
var server = new Hapi.Server()

server.connection({
    port: '9500',
    tls: {
        key: Fs.readFileSync(__dirname + 'registry.blackbeard.dev.key', 'utf8'),
        cert: Fs.readFileSync(__dirname + 'registry.blackbeard.dev.crt', 'utf8')
    }
});

server.route({
  method: 'GET',
  path: '/',
  config: {
    auth: false,
    handler: function(request, reply) {
      reply('!');
    }
  }
});

server.ext('onRequest', function (request, reply) {
    if (request.headers['x-forwarded-proto'] === 'http') {
        console.log('redirect to https');
        return reply().redirect('https://' + request.headers.host + request.url.path).code(301);
    }
    console.log('NO redirect');
    return reply.continue();
});

module.exports = server
