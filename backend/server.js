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
var appRoutes = require('./routes/app')

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
  path: '/preusers',
  handler: preUsersRoutes.postPreUsers
})

server.route({
  method: 'PUT',
  path: '/preusers/{id}',
  handler: preUsersRoutes.putPreUsers
})

server.route({
  method: 'DELETE',
  path: '/preusers/{id}',
  handler: preUsersRoutes.delPreUsers
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

// Apps
server.route({
  method: 'GET',
  path: '/app',
  handler: appRoutes.getApps
})
server.route({
  method: 'POST',
  path: '/app',
  handler: appRoutes.postApp
})
server.route({
  method: 'DELETE',
  path: '/app',
  handler: appRoutes.deleteApp
})
server.route({
  method: 'PUT',
  path: '/app',
  handler: appRoutes.putApp
})
server.route({
  method: 'GET',
  path: '/mg',
  handler: function (request, reply) {
    var api_key = 'key-5859ef062599d1fd5412c49e413f2e26';
    var domain = 'sandbox7790b5e2eec7461d9501b24fa25d8d54.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: config.MAILGUN.key, domain: config.MAILGUN.domain});

    var data = {
        from: 'Jambroo <j@jambroo.com>',
          to: 'jambroo@gmail.com',
            subject: 'Hello, again',
              text: 'Testing some Mailgun awesomness!'
    };

    mailgun.messages().send(data, function (error, body) {
        reply(body);
    });
  }
})

server.start(function() {
  console.log('Server running at:', server.info.uri);
});
