#! /usr/bin/env node

process.stdin.setEncoding('utf8');

var env = ''
process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    env += chunk
  }
})

process.stdin.on('end', function() {
  var http = require('http')
  var fs = require('fs')

  var req = http.request({
    hostname: 'blackbeard.dev',
    port: 8000,
    path: '/clusters',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IjU1OTM5NmJlMDU5NzRiMGMwMGI2YjI4MSI.40uGM0A_DBMJX9ofejbVtPCYuEvXvZ02ZMoOUwVktfw'
    }
  }, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    })
  })

  var envDecoded = JSON.parse(env)
  var certPem = new Buffer(envDecoded['cert.pem'], 'base64').toString()
  var caPem = new Buffer(envDecoded['ca.pem'], 'base64').toString()
  var keyPem = new Buffer(envDecoded['key.pem'], 'base64').toString()

  req.write(JSON.stringify({
    type: 'swarm',
    machines: 3,
    ca: caPem,
    cert: certPem,
    key: keyPem
  }))

  req.end()  
})
