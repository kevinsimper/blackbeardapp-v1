var child_process = require('child_process')
var debug = require('debug')('router')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var http = require('http')
var httpProxy = require('http-proxy')
var url = require('parseurl')
var _ =  require('lodash')

// Had to add hosts file entry to test this for testcontainer.blackbeard.io
var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
}).trim()

var proxy = httpProxy.createProxyServer({})

console.log(ip + ':8000/login')
var adminToken = request({
    method: 'POST',
    uri: 'http://' + ip + ':8000/login',
    json: true,
    body: {
      email: 'admin@blackbeard.io',
      password: 'password'
    }
  }).spread(function(response, body) {
    return body.token
  }).catch(function (err) {
    console.log(err)
    throw new Error('Could not login to backend!', err)
  })

adminToken.then(function(adminToken) {
  http.createServer(function (req, res) {
    var target = url(req.headers.host)
    console.log(req.headers.host, target)

    var app = request({
      method: 'GET',
      uri: 'http://' + ip + ':8000/apps?name=kevin&limit=1',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function (response, body) {
      var app = body[0]
      if(!app.containers | app.containers.length === 0) {
        throw new Error('No containers started on that app')
      }
      return app
    })

    var containers = app.then(function(app) {
      return request({
        method: 'GET',
        uri: 'http://' + ip + ':8000/users/' + app.user +  '/apps/' + app._id + '/containers',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      }).spread(function (resp, body) {
        console.log('con', _.pluck(body, ['ip', 'port']))

        return body
      })
    })

    containers.then(function (containers) {
      var random = _.sample(containers)
      var address = 'http://' + random.ip + ':' + random.port
      console.log('proxying to ' + address)
      proxy.web(req, res, {
        target: address,
        changeOrigin: true
      })
    })

  }).listen(8500, function() {
    console.log('Router is listening!')
  })
})

// var mapper = function (req, callback) {
//   var requestedCname = null
//   var requestedHostnameSplit = req.info.host.split('.')
//   if (requestedHostnameSplit && requestedHostnameSplit.length) {
//     requestedCname = requestedHostnameSplit[0]
//   }
//
//   if (!requestedCname) {
//       return Boom.badRequest("Could not extract CNAME from requested URI.")
//   }
//
//   if (process.env.NODE_ENV != 'production') {
//     if (req.path == 'testcontainer') {
//       return callback(null, 'http://blackbeard.io:80');
//     } else {
//       return Boom.notFound('Could not find any running containers matching this CNAME.')
//     }
//   } else {
//     request({
//       method: 'GET',
//       uri: ip + ':8000/apps/search',
//       json: true,
//       body: requestedCname
//     },
//     function(error, response, body) {
//       if (error) {
//         return Boom.badImplementation()
//       }
//       var containers = body.containers
//       if (containers.length > 0) {
//         // Which container to use? Which instance?
//         var container = containers[Math.floor(Math.random() * containers.length)]
//         return callback(null, "http://"+container.ip);
//       }
//        return Boom.notFound('Could not find any running containers matching this CNAME.')
//      })
//    }
// }
//
// server.route({
//     method: '*',
//     path: '/{p*}',
//     handler: { proxy: { mapUri: mapper } }
// });
//
// server.start(function() {
//     console.log('Server running at:', server.info.uri);
// });
