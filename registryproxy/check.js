var debug = require('debug')('registryproxy:check')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var config = require('./config')

exports.checkCredentials = function(credentials) {
  return new Promise(function(resolve, reject) {
    if (!credentials) {
      return resolve(false)
    }
    if(credentials.name === 'worker' &&
      credentials.pass === config.WORKER_PASSWORD) {
      return resolve(true)
    }
    request({
      method: 'POST',
      uri: config.BACKEND_HOST + '/registrylogin',
      json: true,
      headers: {
        'x-login-from': 'registry'
      },
      body: {
        username: credentials.name,
        password: credentials.pass
      }
    }).spread(function(response, body) {
      debug('status', response.statusCode)
      if (response.statusCode === 200) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

exports.checkPath = function (user, path) {
  return new Promise(function (resolve, reject) {
    var pathArray = path.split('/')
    // if this is empty that means that they are trying
    // to get /v2/ and that is okay!
    if (pathArray[2].length === 0) {
      debug('Path allowed')
      resolve(true)
    }
    if (pathArray[2] === user) {
      debug('Path allowed')
      if(pathArray[3].length === 0) {
        reject(new Error('You have to specify a image name!'))
      } else {
        resolve(true)
      }
    } else {
      debug('Path forbidden!')
      reject(new Error('Path forbidden!'))
    }
  })
}
