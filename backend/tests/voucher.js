var Lab = require('lab')
var lab = exports.lab = Lab.script()
var request = require('request')
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

var token = null
lab.experiment('/app', function() {
  var appId = null
  lab.before(function(done) {
    request({
        method: 'POST',
        uri: appUrl + '/login',
        json: true,
        body: {
          email: 'admin@blackbeard.io',
          password: 'password'
        }
      },
      function(error, response, body) {
        token = body.token
        done()
      })
  })
  var voucherCode
	lab.test('POST /admin/vouchers/generate', function(done) {
	  request({
	    method: 'POST',
	    uri: appUrl + '/admin/vouchers/generate',
	    json: true,
	    headers: {
	      'Authorization': token
	    },
      body: {
        amount: 2000,
        note: "This is an extended\nNOTE!"
      }
	  },
	  function(error, response, body) {
    	expect(body, 'to have key', 'code')
      voucherCode = body.code

	    done()
	  })
	})
  lab.test('GET /admin/vouchers', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/admin/vouchers',
      json: true,
      headers: {
        'Authorization': token
      }
    },
    function(error, response, body) {
      expect(response.statusCode, 'to be', 200)

      done()
    })
  })
  lab.test('POST /vouchers/', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/vouchers/' + voucherCode,
      json: true,
      headers: {
        'Authorization': token
      }
    },
    function(error, response, body) {
      expect(body, 'to equal', {status: 'OK'})

      done()
    })
  })
})