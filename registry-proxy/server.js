var Hapi = require('hapi')
var server = new Hapi.Server()

server.connection({
    port: '9500'
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

module.exports = server
