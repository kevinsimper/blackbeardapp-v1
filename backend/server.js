var Hapi = require('hapi'),
  MongoClient = require('mongodb').MongoClient,
  ObjectID = require('mongodb').ObjectID,
  passwordHash = require('password-hash');
var frontRoutes = require('./routes/front')
var userRoutes = require('./routes/user')

var server = new Hapi.Server({
  connections: {
    routes: {
      cors: true
    }
  }
});
server.connection({
  port: '8000'
});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply('hello world');
  }
});

server.route({
  method: 'POST',
  path: '/signup',
  handler: frontRoutes.postSignup
})

server.route({
  method: 'POST',
  path: '/contact',
  handler: frontRoutes.postContact
});

server.route({
  method: 'POST',
  path: '/user',
  handler: userRoutes.postUser
})

server.route({
  method: 'GET',
  path: '/admin/user',
  handler: userRoutes.getAdminUser
})

server.route({
  method: 'PUT',
  path: '/admin/user',
  handler: userRoutes.putAdminUser
})

server.route({
  method: 'DELETE',
  path: '/admin/user',
  handler: userRoutes.deleteAdminUser
})

server.route({
  method: 'POST',
  path: '/login',
  handler: userRoutes.postLogin
});

server.start(function() {
  console.log('Server running at:', server.info.uri);
});