var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

lab.experiment('/webhook', function() {
  lab.test('/notify/image', function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/webhook/notify/image',
      json: true,
      body: {
        user: 'kevinsimper',
        name: 'busybox'
      }
    })
    .spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)
      done()
    })
  })
})