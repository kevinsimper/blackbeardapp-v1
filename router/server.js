var child_process = require('child_process')
var debug = require('debug')('router')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var http = require('http')
var httpProxy = require('http-proxy')
var _ =  require('lodash')

// Had to add hosts file entry to test this for testcontainer.blackbeard.io
var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
}).trim()

var proxy = httpProxy.createProxyServer({})

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

var getContainers = function () {
  return adminToken.then(function(adminToken) {
    return request({
      method: 'GET',
      uri: 'http://' + ip + ':8000/apps',
      json: true,
      headers: {
        'Authorization': adminToken
      },
      qs: {
        name: 'kevin',
        limit: 1
      }
    }).spread(function (response, body) {
      var app = body[0]
      if(!app.containers || app.containers.length === 0) {
        throw new Error('No containers started on that app')
      }
      return app
    }).then(function(app) {
      return request({
        method: 'GET',
        uri: 'http://' + ip + ':8000/users/' + app.user +  '/apps/' + app._id + '/containers',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      }).spread(function (resp, body) {
        return body
      })
    })
  })
}

http.createServer(function (req, res) {
  console.log(req.headers.host)

  getContainers().then(function (containers) {
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
