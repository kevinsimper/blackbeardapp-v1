if(process.env.NODE_ENV == 'production') {
  require('newrelic')
}

var debug = require('debug')('router')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var http = require('http')
var httpProxy = require('http-proxy')
var _ =  require('lodash')
var config = require('./config')

var proxy = httpProxy.createProxyServer({})

var adminToken = config.ADMIN_TOKEN

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
      debug('apps search', body)
      var app = body[0]
      if(body.length === 0) {
        throw new Error('No app with that name!')
      }
      if(!app.containers || app.containers.length === 0) {
        throw new Error('No containers started on that app')
      }
      return request({
        method: 'GET',
        uri: config.BACKEND_HOST + '/users/' + app.user +  '/apps/' + app._id + '/containers',
        json: true,
        headers: {
          'Authorization': adminToken
        }
      })
    }).spread(function (response, body) {
      debug('response', response.statusCode, body.length)
      return _.filter(body, {deleted: false}) || []
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

var app = http.createServer(function (req, res) {
  var details = parseHost(req.headers.host)
  // there should be onlu one subdomain,
  // else somebody is trying to access some illegal
  if(details.subdomains.length !== 1) {
    return res.end('Missing something!')
  }
  var appname = details.subdomains[0]
  getContainers(appname).then(function (containers) {
    debug('containers', containers)
    var random = _.sample(containers)
    var address = 'http://' + random.ip + ':' + random.port
    debug('proxying to ' + address)
    proxy.web(req, res, {
      target: address,
      changeOrigin: true
    })
    proxy.on('error', function(e) {
      console.log(e.stack)
      res.end('Website is down!')
    })
  }).catch(function (err) {
    debug('could not find', appname)
    debug('error', err.stack)
    res.end('No app with that name!')
  })

})

var port = 8500
app.listen(port, function() {
  console.log('Router is listening on', port)
})
