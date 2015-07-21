var express = require('express')
var Promise = require('bluebird')
var app = express()
var https = require('https')
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

var checkCredentials = function(credentials) {
  return new Promise(function(resolve, reject) {
    if (process.env.NODE_ENV !== 'production') {
      if(!credentials) {
        resolve(false)
      }
      if(credentials.name === 'blackbeard' || credentials.pass === 'password') {
        resolve(true)
      } else {
        resolve(false)
      }
    } else {
      request({
        method: 'POST',
        uri: 'http://' + ip.trim() + ':8000/login',
        json: true,
        body: {
          email: credentials.name,
          password: credentials.pass
        }
      }).spread(function(response, body) {
        if(response.statusCode === 200) {
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

app.all('/v2/*', function(req, res) {
  var credentials = auth(req)
  res.setHeader('Docker-Distribution-API-Version', 'registry/2.0')

  checkCredentials(credentials).then(function(valid) {
    if (!credentials || !valid) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="Blackbeard"')
      return res.end('Access denied')
    }
    
    var url = 'http://' + ip.trim() + ':5000' + req.originalUrl
    debug('Url requested', req.method, url)
    var proxyRequest = proxy(url)
    proxyRequest.on('error', function(err) {
      debug('ERROR', err)
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

module.exports = https.createServer(options, app)
