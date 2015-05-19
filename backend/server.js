require('newrelic')

var Hapi = require('hapi')
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var mongoose = require('mongoose')

var config = require('./config')

mongoose.connect(config.DATABASE_URL, function() {
  console.log('mongoose connected to mongodb')
})

var preUsersRoutes = require('./routes/preusers')
var frontRoutes = require('./routes/front')
var userRoutes = require('./routes/user')
var adminRoutes = require('./routes/admin')

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
  method: 'GET',
  path: '/preusers',
  handler: preUsersRoutes.getPreUsers
})

server.route({
  method: 'POST',
  path: '/presignup',
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
  method: 'POST',
  path: '/login',
  handler: userRoutes.postLogin
});

server.route({
  method: 'GET',
  path: '/admin/user',
  handler: adminRoutes.getAdminUser
})

server.route({
  method: 'PUT',
  path: '/admin/user',
  handler: adminRoutes.putAdminUser
})

server.route({
  method: 'DELETE',
  path: '/admin/user',
  handler: adminRoutes.deleteAdminUser
})

server.start(function() {
  console.log('Server running at:', server.info.uri);
});
