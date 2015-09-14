var Hapi = require('hapi')
var passwordHash = require('password-hash')
var mongoose = require('mongoose')
var Promise = require('bluebird')
Promise.promisifyAll(require("mongoose"))

var config = require('./config')

mongoose.connect(config.DATABASE_URL, function() {
  console.log('Mongoose connected to MongoDB:')
  console.log("\t"+config.DATABASE_URL)
})

var User = require('./models/User.js')
var userRoles = require('./models/roles')
var preUsersRoutes = require('./routes/preusers')
var frontRoutes = require('./routes/front')
var userRoutes = require('./routes/user')
var adminRoutes = require('./routes/admin')
var appRoutes = require('./routes/app')
var imageRoutes = require('./routes/image')
var creditcardRoutes = require('./routes/creditcard')
var forgotRoutes = require('./routes/forgot')
var webhookRoutes = require('./routes/webhook')
var imageRoutes = require('./routes/image')
var logRoutes = require('./routes/log')
var clusterRoutes = require('./routes/cluster')
var voucherRoutes = require('./routes/voucher')
var billingRoutes = require('./routes/billing')
var containerRoutes = require('./routes/container')
var registryRoutes = require('./routes/registry')

var server = new Hapi.Server({
  connections: {
    routes: {
      cors: true
    }
  }
})

var port = 8000
server.connection({ port: port })

server.register(require('hapi-auth-jwt2'), function(err) {
  if(err) {
    console.log(err)
  }

  server.auth.strategy('jwt', 'jwt', true, {
    key: process.env.AUTH_SECRET,
    validateFunc: function(decoded, request, callback) {
      User.findById(decoded, function(err, user) {
        // check if user is allowed to access that specific route
        var routeLevel = request.route.settings.app.level
        if(typeof routeLevel !== 'undefined' && !userRoles.isAllowed(routeLevel, user.role)) {
          callback(null, false)
          request.log('not allowed')
        }

        if ((user.role == userRoles.USER) && (request.path) && (request.path.search("\/") != -1) &&
          (request.path.substr(0, "/users/".length) == "/users/") && (request.path.split("/")[2] != "me")) {
          // Non admin user trying to access /user/ path
          callback(null, false)
        } else if (user) {
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
        reply('hello world')
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/3rr0rs',
    config: {
      auth: false,
      handler: function(request, reply) {
        fs = require('fs');
        fs.readFile('/var/log/blackbeard_backend.log', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }

          reply('<pre>'+data+'</pre>')
        });
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/secure',
    config: {
      auth: 'jwt',
      handler: function(request, reply) {
        reply(request.auth)
      }
    }
  })

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
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
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
  })
  server.route({
    method: 'POST',
    path: '/queue',
    config: {
      auth: false,
      handler: frontRoutes.getQueue
    }
  })

  server.route({
    method: 'POST',
    path: '/users/{user}/username',
    config: {
      auth: 'jwt',
      handler: userRoutes.postUserUsername
    }
  })
  server.route({
    method: 'POST',
    path: '/users',
    config: {
      auth: false,
      handler: userRoutes.postUser
    }
  })
  server.route({
    method: 'GET',
    path: '/users',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: userRoutes.getUsers
    }
  })
  server.route({
    method: 'GET',
    path: '/users/{user}',
    config: {
      auth: 'jwt',
      handler: userRoutes.getOneUser
    }
  })
  server.route({
    method: 'PUT',
    path: '/users/me',
    config: userRoutes.putMe
  })
  server.route({
    method: 'PUT',
    path: '/users/{user}',
    config: userRoutes.putUsers
  })
  server.route({
    method: 'DELETE',
    path: '/users/{user}',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: userRoutes.delUsers
    }
  })

  server.route({
    method: 'POST',
    path: '/login',
    config: {
      auth: false,
      handler: userRoutes.postLogin
    }
  })

  server.route({
    method: 'POST',
    path: '/registrylogin',
    config: {
      auth: false,
      handler: userRoutes.postRegistrylogin
    }
  })

  server.route({
    method: 'GET',
    path: '/users/{user}/payments',
    config: {
      auth: 'jwt',
      handler: userRoutes.getUserPayments
    }
  })

  server.route({
    method: 'GET',
    path: '/users/{user}/creditlogs',
    config: billingRoutes.getCreditLogs
  })

  server.route({
    method: 'GET',
    path: '/creditlogs',
    config: billingRoutes.getAllCreditLogs
  })

  server.route({
    method: 'POST',
    path: '/forgot',
    config: {
      auth: false,
      handler: forgotRoutes.postForgot
    }
  })

  server.route({
    method: 'POST',
    path: '/forgot/{token}',
    config: {
      auth: false,
      handler: forgotRoutes.postForgotReset
    }
  })

  server.route({
    method: 'GET',
    path: '/users/{user}/creditcards',
    config: {
      auth: 'jwt',
      handler: creditcardRoutes.getCreditCards
    }
  })

  server.route({
    method: 'GET',
    path: '/users/{user}/creditcards/{creditcard}',
    config: {
      auth: 'jwt',
      handler: creditcardRoutes.getCreditCard
    }
  })

  server.route({
    method: 'POST',
    path: '/users/{user}/creditcards',
    config: {
      auth: 'jwt',
      handler: creditcardRoutes.postCreditCards
    }
  })

  server.route({
    method: 'POST',
    path: '/users/{user}/creditcards/{creditcard}/charge',
    config: {
      auth: 'jwt',
      handler: creditcardRoutes.postCreditCardPayment
    }
  })

  server.route({
    method: 'POST',
    path: '/users/{user}/creditcards/{creditcard}/activate',
    config: {
      auth: 'jwt',
      handler: creditcardRoutes.postCreditCardActivate
    }
  })

  server.route({
    method: 'DELETE',
    path: '/users/{user}/creditcards/{creditcard}',
    config: {
      auth: 'jwt',
      handler: creditcardRoutes.deleteCreditCards
    }
  })

  // Admin routes
  server.route({
    method: 'GET',
    path: '/admin/invite',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: adminRoutes.inviteUser
    }
  })

  // Vouchers
  server.route({
    method: 'POST',
    path: '/vouchers',
    config: voucherRoutes.generateVoucher
  })
  server.route({
    method: 'GET',
    path: '/vouchers',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: voucherRoutes.getVouchers
    }
  })
  server.route({
    method: 'GET',
    path: '/vouchers/{voucher}',
    config: {
      auth: false,
      handler: voucherRoutes.verifyVoucher
    }
  })
  server.route({
    method: 'POST',
    path: '/users/{user}/vouchers',
    config: voucherRoutes.claimVoucher
  })
  server.route({
    method: 'GET',
    path: '/users/{user}/vouchers',
    config: voucherRoutes.getUsedVouchers
  })

  // Apps
  server.route({
    method: 'GET',
    path: '/users/{user}/apps',
    config: {
      auth: 'jwt',
      handler: appRoutes.getApps
    }
  })
  server.route({
    method: 'GET',
    path: '/apps',
    config: appRoutes.getAllApps
  })
  server.route({
    method: 'POST',
    path: '/users/{user}/apps',
    config: appRoutes.postApp
  })
  server.route({
    method: 'DELETE',
    path: '/users/{user}/apps/{app}',
    config: {
      auth: 'jwt',
      handler: appRoutes.deleteApp
    }
  })
  server.route({
    method: 'PUT',
    path: '/users/{user}/apps/{app}',
    config: {
      auth: 'jwt',
      handler: appRoutes.putApp
    }
  })
  server.route({
    method: 'POST',
    path: '/users/{user}/apps/{app}/containers',
    config: {
      auth: 'jwt',
      handler: containerRoutes.postContainer
    }
  })
  server.route({
    method: 'GET',
    path: '/users/{user}/apps/{app}/containers',
    config: {
      auth: 'jwt',
      handler: containerRoutes.getContainers
    }
  })
  server.route({
    method: 'GET',
    path: '/users/{user}/apps/{app}/containers/{container}',
    config: {
      auth: 'jwt',
      handler: containerRoutes.getContainer
    }
  })
  server.route({
    method: 'DELETE',
    path: '/users/{user}/apps/{app}/containers/{container}',
    config: {
      auth: 'jwt',
      handler: containerRoutes.deleteContainer
    }
  })
  server.route({
    method: 'GET',
    path: '/users/{user}/apps/{app}/logs',
    config: {
      auth: 'jwt',
      handler: appRoutes.getAppLogs
    }
  })
  server.route({
    method: 'GET',
    path: '/users/{user}/billing/{month}',
    config: {
      auth: 'jwt',
      handler: appRoutes.getUserBilling
    }
  })
  server.route({
    method: 'GET',
    path: '/billing',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: billingRoutes.getAllBilling
    }
  })

  // Images
  server.route({
    method: 'GET',
    path: '/users/{user}/images',
    config: {
      auth: 'jwt',
      handler: imageRoutes.getImages
    }
  })

  server.route({
    method: 'GET',
    path: '/users/{user}/logs',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: userRoutes.getUserLogs
    }
  })

  // Webhook (associated with images)
  server.route({
    method: 'POST',
    path: '/webhook/notify/image',
    config: {
      auth: false,
      handler: webhookRoutes.postNotifyImage
    }
  })
  server.route({
    method: 'GET',
    path: '/logs',
    config: {
      auth: 'jwt',
      app: {
        level: 'ADMIN'
      },
      handler: logRoutes.getLogs
    }
  })

  server.route({
    method: 'GET',
    path: '/clusters',
    config: clusterRoutes.getClusters
  })
  server.route({
    method: 'POST',
    path: '/clusters',
    config: clusterRoutes.postCluster
  })
  server.route({
    method: 'DELETE',
    path: '/clusters/{id}',
    config: clusterRoutes.deleteCluster
  })
  server.route({
    method: 'GET',
    path: '/clusters/{cluster}/status',
    config: clusterRoutes.getClusterStatus
  })
  server.route({
    method: 'GET',
    path: '/clusters/{cluster}/usage',
    config: clusterRoutes.getClusterUsage
  })
  server.route({
    method: 'GET',
    path: '/clusters/{cluster}/containers',
    config: clusterRoutes.getClusterContainers
  })
  server.route({
    method: 'GET',
    path: '/clusters/{cluster}/startcontainer',
    config: clusterRoutes.getClusterStartContainer
  })

  server.route({
    method: 'GET',
    path: '/registry/images',
    config: registryRoutes.getRegistryAllImages
  })
})

module.exports = server
