var child_process = require('child_process')

var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
}).trim()

if (process.env.REGISTRY_HOST && process.env.NODE_ENV === 'production') {
  exports.REGISTRY_HOST = process.env.REGISTRY_HOST
} else {
  exports.REGISTRY_HOST = 'http://' + ip + ':5000'
}

if (process.env.BACKEND_HOST && process.env.NODE_ENV === 'production') {
  exports.BACKEND_HOST = process.env.BACKEND_HOST
} else {
  exports.BACKEND_HOST = 'http://' + ip + ':8000'
}
