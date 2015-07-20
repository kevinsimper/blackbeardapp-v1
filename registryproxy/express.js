var express = require('express')
var app = express()
var https = require('https')
var fs = require('fs')
var child_process = require('child_process')

var port = 9500
var options = {
  key: fs.readFileSync(__dirname + '/registry.blackbeard.dev.key', 'utf8'),
  cert: fs.readFileSync(__dirname + '/registry.blackbeard.dev.crt', 'utf8')
}

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

app.all('*', function(req, res) {
  res.send('hello')
})

module.exports = https.createServer(options, app)
