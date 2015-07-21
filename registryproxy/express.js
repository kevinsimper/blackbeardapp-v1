var express = require('express')
var app = express()
var https = require('https')
var fs = require('fs')
var child_process = require('child_process')
var auth = require('basic-auth')
var request = require('request')
var debug = require('debug')('proxy')

var port = 9500
var options = {
  key: fs.readFileSync(__dirname + '/registry.blackbeard.dev.key', 'utf8'),
  cert: fs.readFileSync(__dirname + '/registry.blackbeard.dev.crt', 'utf8')
}

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

app.all('/v2/*', function(req, res) {
  var credentials = auth(req)
  res.setHeader('Docker-Distribution-API-Version', 'registry/2.0')

  if (!credentials || credentials.name !== 'blackbeard' || credentials.pass !== 'password') {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="Blackbeard"')
    res.end('Access denied')
  } else {
    var url = 'http://' + ip.trim() + ':5000' + req.originalUrl
    debug('Url requested', req.method, url)
    var proxyRequest = request(url)
    proxyRequest.on('error', function(err) {
      debug('ERROR', err)
    })
    req.pipe(proxyRequest).pipe(res)
  }
})

app.all('/v1/*', function(req, res) {
  res.sendStatus(404)
})

app.all('*', function(req, res) {
  res.redirect('https://blackbeard.io')
})

module.exports = https.createServer(options, app)
