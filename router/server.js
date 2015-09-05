var debug = require('debug')('router')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var http = require('http')
var httpProxy = require('http-proxy')
var _ =  require('lodash')
var config = require('./config')

var proxy = httpProxy.createProxyServer({})

var adminToken = request({
  method: 'POST',
  uri: config.BACKEND_HOST + '/login',
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

var getContainers = function (appname) {
  return adminToken.then(function(adminToken) {
    return request({
      method: 'GET',
      uri: config.BACKEND_HOST + '/apps',
      json: true,
      headers: {
        'Authorization': adminToken
      },
      qs: {
        name: appname,
        limit: 1
      }
    }).spread(function (response, body) {
      var app = body[0]
      if(body.length === 0) {
        throw new Error('No app with that name!')
      }
      if(!app.containers || app.containers.length === 0) {
        throw new Error('No containers started on that app')
      }
      return app
    }).then(function(app) {
      return request({
        method: 'GET',
        uri: config.BACKEND_HOST + '/users/' + app.user +  '/apps/' + app._id + '/containers',
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

var parseHost = function (host) {
  var parsed = {}
  if(host.indexOf(':')) {
    var portSplit = host.split(':')
    parsed.port = portSplit[1]
    host = portSplit[0]
  }
  host = host.split('.')
  parsed.tld = host.pop()
  parsed.domain = host.pop()
  parsed.subdomains = host
  return parsed
}

http.createServer(function (req, res) {
  var details = parseHost(req.headers.host)
  // there should be two subdomains
  // the appname and apps
  if(details.subdomains.length !== 2) {
    return res.end('Missing something!')
  }
  var appname = details.subdomains[0]
  getContainers(appname).then(function (containers) {
    var random = _.sample(containers)
    var address = 'http://' + random.ip + ':' + random.port
    debug('proxying to ' + address)
    proxy.web(req, res, {
      target: address,
      changeOrigin: true
    })
  }).catch(function () {
    res.end('No app with that name!')
  })

}).listen(8500, function() {
  console.log('Router is listening!')
})
