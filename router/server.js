var Hapi = require('hapi')
var child_process = require('child_process')
var debug = require('debug')('router')
var request = require('request')
var Boom = require('boom')

var server = new Hapi.Server()
server.connection({
    port: '8500'
})

// Had to add hosts file entry to test this as:
// 88.80.187.61 jambroo.dev.jambroo.com
// TODO: Register domain and handle subdomains properly

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
})

var mapper = function (req, callback) {
  if (process.env.NODE_ENV != 'production') {
    if (req.path == 'testcname') {
      return callback(null, 'http://173.255.221.154:80');
    } else {
      return Boom.notFound('Could not find any running containers matching this CNAME.')
    }
  } else {
    var requestedCname = null
    var requestedHostnameSplit = req.info.host.split('.')
    if (requestedHostnameSplit && requestedHostnameSplit.length) {
        requestedCname = requestedHostnameSplit[0]
    }

    if (!requestedCname) {
        return Boom.badRequest("Could not extract CNAME from requested URI.")
    }

    request({
      method: 'GET',
      uri: ip + ':8000/apps/search',
      json: true,
      body: requestedCname
    },
    function(error, response, body) {
      if (error) {
        return Boom.badImplementation()
      }
      var containers = body.containers
      if (containers.length > 0) {
        // Which container to use? Which instance?
        var container = containers[0]
        return callback(null, "http://"+container.ip);
      }
      return Boom.notFound('Could not find any running containers matching this CNAME.')
    })
  }
}

server.route({
    method: '*',
    path: '/{p*}',
    handler: { proxy: { mapUri: mapper } }
});

server.start(function() {
    console.log('Server running at:', server.info.uri);
});
