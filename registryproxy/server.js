var express = require('express')
var Promise = require('bluebird')
var app = express()
var https = require('https')
var http = require('http')
var fs = require('fs')
var auth = require('basic-auth')
var proxy = require('request')
var request = Promise.promisify(require('request'))
var debug = require('debug')('proxy')
var config = require('./config')
var check = require('./check')

var options = {
  key: fs.readFileSync(__dirname + '/registry.blackbeard.dev.key', 'utf8'),
  cert: fs.readFileSync(__dirname + '/registry.blackbeard.dev.crt', 'utf8')
}

app.disable('x-powered-by')

app.all('/v2/*', function(req, res) {
  var random = Math.floor(100 * Math.random())
  var credentials = auth(req)
  res.setHeader('Docker-Distribution-API-Version', 'registry/2.0')
  debug(random, 'request started', req.method, req.originalUrl)
  debug(random, 'headers', req.headers)
  check.checkCredentials(credentials).then(function (valid) {
    debug(random, 'got credentials', credentials, valid)
    if (!credentials || !valid) {
      throw new Error('Access denied')
    }

    return check.checkPath(credentials.name, req.originalUrl).then(function () {
      var url = config.REGISTRY_HOST + req.originalUrl
      var host = req.headers.Host
      if (process.env.NODE_ENV === 'production') {
        host = 'registry.blackbeard.io'
      }

      debug(random, 'Proxying URL', url)
      var proxyRequest = proxy({
        url: url,
        method: req.method,
        headers: {
          'Host': host
        },
        followRedirect: false
      })
      proxyRequest.on('error', function(err) {
        debug(random, 'ERROR', err)
      })
      proxyRequest.on('response', function(response) {
        debug(random, 'Answer', response.statusCode, response.headers['content-type'], response.headers)
        response.on('data', function(data) {
          debug(random, 'Answer data', data)
        })
        if(response.statusCode === 201 && req.method === 'PUT') {
          var user = req.originalUrl.split('/')[2]
          var name = req.originalUrl.split('/')[3]
          var dockerContentDigest = response.headers['docker-content-digest']

          // PING BACKEND - NEW CONTAINER UPLOADED
          request({
            method: 'POST',
            uri: config.BACKEND_HOST + '/webhook/notify/image',
            json: true,
            body: {
              user: user,
              name: name,
              dockerContentDigest: dockerContentDigest
            }
          })
          debug(random, 'webhook triggered', user, name)
        }
      })

      req.pipe(proxyRequest).pipe(res)
    }).catch(function (error) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="Blackbeard"')
      res.end('Access denied - You don\'t own the ressource')
    })
  }).catch(function (error) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="Blackbeard"')
    res.end('Access denied')
  })
})

app.all('/v1/*', function(req, res) {
  res.sendStatus(404)
})

app.get('/status', function (req, res) {
  res.send({
    status: 'OK'
  })
})

app.all('*', function(req, res) {
  res.redirect('https://blackbeard.io')
})

if (process.env.NODE_ENV === 'production') {
  module.exports = http.createServer(app)
} else {
  module.exports = https.createServer(options, app)
}
