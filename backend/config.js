var child_process = require('child_process')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var ip = child_process.execSync('/sbin/ip route|awk \'/default/ { print $3 }\'', {
  encoding: 'utf8'
}).trim()

if(process.env.NODE_ENV == 'production') {
  exports.DATABASE_URL = process.env.DATABASE_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.DATABASE_URL !== 'undefined')) {
  exports.DATABASE_URL = process.env.DATABASE_URL
} else {
  exports.DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard'
}

if(process.env.NODE_ENV == 'production') {
  exports.RABBITMQ_URL = process.env.RABBITMQ_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.RABBITMQ_URL !== 'undefined')) {
  exports.RABBITMQ_URL = process.env.RABBITMQ_URL
} else {
  exports.RABBITMQ_URL = 'amqp://' + process.env.RABBITMQ_PORT.replace('tcp://', '')
}

if(process.env.NODE_ENV == 'production') {
  exports.REGISTRY_URL = process.env.REGISTRY_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.REGISTRY_URL !== 'undefined')) {
  exports.REGISTRY_URL = process.env.REGISTRY_URL
} else {
  exports.REGISTRY_URL = 'registry.blackbeard.dev:9500'
}

if(process.env.NODE_ENV == 'production') {
  exports.REGISTRY_FULLURL = process.env.REGISTRY_FULLURL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.REGISTRY_FULLURL !== 'undefined')) {
  exports.REGISTRY_FULLURL = process.env.REGISTRY_FULLURL
} else {
  exports.REGISTRY_FULLURL = 'http://' + ip + ':5000'
}


if(process.env.NODE_ENV == 'production') {
  exports.WORKER_PASSWORD = process.env.WORKER_PASSWORD
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.WORKER_PASSWORD !== 'undefined')) {
  exports.WORKER_PASSWORD = process.env.WORKER_PASSWORD
} else {
  exports.WORKER_PASSWORD = 'development'
}

if(process.env.NODE_ENV == 'production') {
  exports.BACKEND_URL = process.env.BACKEND_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.BACKEND_URL !== 'undefined')) {
  exports.BACKEND_URL = process.env.BACKEND_URL
} else {
  exports.BACKEND_URL = 'http://' + ip + ':8000'
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
