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

req.write(JSON.stringify({
  type: 'swarm',
  machines: 3,
  ca: fs.readFileSync('/Users/kevinsimper/.docker/machine/machines/swarm-master/ca.pem', 'utf8'),
  cert: fs.readFileSync('/Users/kevinsimper/.docker/machine/machines/swarm-master/cert.pem', 'utf8'),
  key: fs.readFileSync('/Users/kevinsimper/.docker/machine/machines/swarm-master/key.pem', 'utf8')
}))

req.end()
