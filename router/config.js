var child_process = require('child_process')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
}).trim()

if(process.env.NODE_ENV == 'production') {
  exports.BACKEND_HOST = process.env.BACKEND_HOST
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.BACKEND_HOST !== 'undefined')) {
  exports.BACKEND_HOST = process.env.BACKEND_HOST
} else {
  exports.BACKEND_HOST = 'http://' + ip + ':8000'
}

if(process.env.NODE_ENV == 'production') {
  exports.ADMIN_TOKEN = Promise.resolve(process.env.ADMIN_TOKEN)
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.ADMIN_TOKEN !== 'undefined')) {
  exports.ADMIN_TOKEN = Promise.resolve(process.env.ADMIN_TOKEN)
} else {
  exports.ADMIN_TOKEN = request({
    method: 'POST',
    uri:  'http://' + ip + ':8000/login',
    json: true,
    body: {
      email: 'admin@blackbeard.io',
      password: 'password'
    }
  }).spread(function(response, body) {
    return body.token
  }).catch(function (err) {
    console.log(err)
    throw new Error('Could not login to backend!', err)
  })
}
