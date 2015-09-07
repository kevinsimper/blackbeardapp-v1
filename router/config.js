var child_process = require('child_process')

if(process.env.NODE_ENV == 'production') {
  exports.BACKEND_HOST = process.env.BACKEND_HOST
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.BACKEND_HOST !== 'undefined')) {
  exports.BACKEND_HOST = process.env.BACKEND_HOST
} else {
  var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
    encoding: 'utf8'
  }).trim()
  exports.BACKEND_HOST = 'http://' + ip + ':8000'
}
