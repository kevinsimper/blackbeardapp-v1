var Hapi = require('hapi')
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var passwordHash = require('password-hash')
var mongoose = require('mongoose')

var config = require('./config')

mongoose.connect(config.DATABASE_URL, function() {
  console.log('Mongoose connected to MongoDB:')
  console.log("\t"+config.DATABASE_URL)
})

var User = require('./models/User.js')
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

var port = 8000;
if ((process.argv.length > 2) && (process.argv[2] == 'tests/api.js')) {
  port = 80001;
}

server.connection({ port: port })

server.register(require('hapi-auth-jwt2'), function(err) {
  if(err) {
    console.log(err)
  }

  server.auth.strategy('jwt', 'jwt', true, {
    key: config.AUTH_SECRET,
    validateFunc: function(decoded, request, callback) {
      User.findById(decoded, function(err, user) {
        if(user) {
          callback(null, true, user)
        } else {
          callback(null, false)
        }
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: false,
      handler: function(request, reply) {
        reply('hello world');
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/secure',
    config: {
      auth: 'jwt',
      handler: function(request, reply) {
        reply(request.auth)
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/preusers',
    config: {
      auth: false,
      handler: preUsersRoutes.getPreUsers
    }
  })

  server.route({
    method: 'POST',
    path: '/preusers',
    config: {
      auth: false,
      handler: preUsersRoutes.postPreUsers
    }
  })

  server.route({
    method: 'PUT',
    path: '/preusers/{id}',
    config: {
      auth: false,
      handler: preUsersRoutes.putPreUsers
    }
  })

  server.route({
    method: 'DELETE',
    path: '/preusers/{id}',
    config: {
      auth: false,
      handler: preUsersRoutes.delPreUsers
    }
  })

  server.route({
    method: 'POST',
    path: '/presignup',
    config: {
      auth: false,
      handler: frontRoutes.postSignup
    }
  })

  server.route({
    method: 'POST',
    path: '/contact',
    config: {
      auth: false,
      handler: frontRoutes.postContact
    }
  });

  server.route({
    method: 'POST',
    path: '/user',
    config: {
      auth: false,
      handler: userRoutes.postUser
    }
  })

  server.route({
    method: 'POST',
    path: '/login',
    config: {
      auth: false,
      handler: userRoutes.postLogin
    }
  });

  server.route({
    method: 'GET',
    path: '/admin/user',
    config: {
      auth: false,
      handler: adminRoutes.getAdminUser
    }
  })

  server.route({
    method: 'PUT',
    path: '/admin/user',
    config: {
      auth: false,
      handler: adminRoutes.putAdminUser
    }
  })

  server.route({
    method: 'DELETE',
    path: '/admin/user',
    config: {
      auth: false,
      handler: adminRoutes.deleteAdminUser
    }
  })

  server.route({
    method: 'GET',
    path: '/admin/invite',
    config: {
      auth: 'jwt',
      handler: adminRoutes.inviteUser
    }
  })


  // Apps
  server.route({
    method: 'GET',
    path: '/app',
    config: {
      auth: 'jwt',
      handler: appRoutes.getApps
    }
  })
  server.route({
    method: 'POST',
    path: '/app',
    config: {
      auth: 'jwt',
      handler: appRoutes.postApp
    }
  })
  server.route({
    method: 'DELETE',
    path: '/app',
    config: {
      auth: 'jwt',
      handler: appRoutes.deleteApp
    }
  })
  server.route({
    method: 'PUT',
    path: '/app',
    config: {
      auth: 'jwt',
      handler: appRoutes.putApp
    }
  })
  
})

server.start()
module.exports = server
