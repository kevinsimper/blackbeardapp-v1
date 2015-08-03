var express = require('express')
var Promise = require('bluebird')
var app = express()
var https = require('https')
var http = require('http')
var fs = require('fs')
var child_process = require('child_process')
var auth = require('basic-auth')
var proxy = require('request')
var request = Promise.promisify(require('request'))
var debug = require('debug')('proxy')

var port = 9500
var options = {
  key: fs.readFileSync(__dirname + '/registry.blackbeard.dev.key', 'utf8'),
  cert: fs.readFileSync(__dirname + '/registry.blackbeard.dev.crt', 'utf8')
}

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

var REGISTRY_HOST
if (process.env.REGISTRY_HOST && process.env.NODE_ENV === 'production') {
  REGISTRY_HOST = process.env.REGISTRY_HOST
} else {
  REGISTRY_HOST = 'http://' + ip.trim() + ':5000'
}

var BACKEND_HOST
if (process.env.BACKEND_HOST && process.env.NODE_ENV === 'production') {
  BACKEND_HOST = process.env.BACKEND_HOST
} else {
  BACKEND_HOST = 'http://' + ip.trim() + ':8000'
}
console.log(BACKEND_HOST)

var checkCredentials = function(credentials) {
  return new Promise(function(resolve, reject) {
    if (!credentials) {
      return resolve(false)
    }
    if (process.env.NODE_ENV !== 'production') {
      if (credentials.name === 'blackbeard' || credentials.pass === 'password') {
        resolve(true)
      } else {
        resolve(false)
      }
    } else {
      request({
        method: 'POST',
        uri: BACKEND_HOST + '/login',
        json: true,
        body: {
          email: credentials.name,
          password: credentials.pass
        }
      }).spread(function(response, body) {
        if (response.statusCode === 200) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
        .catch(function(err) {
          console.log(err)
        })
    }
  })
}

app.disable('x-powered-by')

app.all('/v2/*', function(req, res) {
  var credentials = auth(req)
  res.setHeader('Docker-Distribution-API-Version', 'registry/2.0')
  debug('request started', req.method, req.originalUrl)
  checkCredentials(credentials).then(function(valid) {
    if (!credentials || !valid) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="Blackbeard"')
      return res.end('Access denied')
    }

    var url = REGISTRY_HOST + req.originalUrl
    var host = req.headers['Host']
    if (process.env.NODE_ENV === 'production') {
      host = 'registry.blackbeard.io'
    }
    var proxyRequest = proxy({
      url: url,
      method: req.method,
      headers: {
        'Host': host
      }
    })
    proxyRequest.on('error', function(err) {
      debug('ERROR', err)
    })
    proxyRequest.on('response', function(response) {
      debug('Answer', response.statusCode, response.headers['content-type'])
      if(response.statusCode === 202 && req.method === 'PUT') {
        var user = req.originalUrl.split('/')[2]
        var name = req.originalUrl.split('/')[3]

        // PING BACKEND - NEW CONTAINER UPLOADED
        request({
          method: 'POST',
          uri: BACKEND_HOST + '/webhook/notify/image',
          json: true,
          body: {
            user: user,
            name: name
          }
        })
        debug('webhook triggered', user, name)
      }
    })

    req.pipe(proxyRequest).pipe(res)
  })
})

app.all('/v1/*', function(req, res) {
  res.sendStatus(404)
})

app.all('*', function(req, res) {
  res.redirect('https://blackbeard.io')
})

if (process.env.NODE_ENV === 'production') {
  module.exports = http.createServer(app)
} else {
  module.exports = https.createServer(options, app)
}
