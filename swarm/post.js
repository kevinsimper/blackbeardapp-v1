#! /usr/bin/env node

// Fill out accessToken (from existing login) and ip below with your local configuration
var accessToken = ''
var ip = ''
if(!accessToken) {
  throw new Error('You have to define accessToken!')
}
if(!ip) {
  throw new Error('You have to define the swarm-master ip!')
}

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
      'Authorization': accessToken
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
  var idRSA = new Buffer(envDecoded['id_rsa'], 'base64').toString()
  var idRSAPub = new Buffer(envDecoded['id_rsa.pub'], 'base64').toString()

  req.write(JSON.stringify({
    type: 'swarm',
    machines: 3,
    ip: ip,
    ca: caPem,
    cert: certPem,
    key: keyPem,
    sshPrivate: idRSA,
    sshPublic: idRSAPub,
    sshUser: 'docker',
    memory: 1024
  }))

  req.end()
})
