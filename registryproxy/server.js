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
    request({
      method: 'POST',
      uri: BACKEND_HOST + '/registrylogin',
      json: true,
      headers: {
        'x-login-from': 'registry'
      },
      body: {
        username: credentials.name,
        password: credentials.pass
      }
    }).spread(function(response, body) {
      debug('status', response.statusCode)
      if (response.statusCode === 200) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

var checkPath = function (user, path) {
  return new Promise(function (resolve, reject) {
    var pathArray = path.split('/')
    // if this is empty that means that they are trying
    // to get /v2/ and that is okay!
    if (pathArray[2].length === 0) {
      debug('Path allowed')
      resolve()
    }
    if (pathArray[2] === user) {
      debug('Path allowed')
      resolve()
    } else {
      debug('Path forbidden!')
      reject()
    }
  })
}

app.disable('x-powered-by')

app.all('/v2/*', function(req, res) {
  var random = Math.floor(100 * Math.random())
  var credentials = auth(req)
  res.setHeader('Docker-Distribution-API-Version', 'registry/2.0')
  debug(random, 'request started', req.method, req.originalUrl)
  debug(random, 'headers', req.headers)
  checkCredentials(credentials).then(function (valid) {
    debug(random, 'got credentials', credentials, valid)
    if (!credentials || !valid) {
      throw new Error('Access denied')
    }

    return checkPath(credentials.name, req.originalUrl).then(function () {
      var url = REGISTRY_HOST + req.originalUrl
      var host = req.headers['Host']
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
