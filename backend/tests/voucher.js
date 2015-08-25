var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var expect = require('unexpected')
var _ = require('lodash')

var helpers = require('./helpers/')
var appUrl = helpers.appUrl()

var server = require('../server')
server.start(function() {
  console.log('Server running at:', server.info.uri)
})

var VOUCHER_AMOUNT = 2000
var token = null
var adminToken = null
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
    }).spread(function(response, body) {
      adminToken = body.token
      done()
    }).catch(function(err) {
      console.log(err)
    })
  })
  lab.before(function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/login',
      json: true,
      body: {
        email: 'user@blackbeard.io',
        password: 'password'
      }
    }).spread(function(response, body) {
      token = body.token
      done()
    }).catch(function(err) {
      console.log(err)
    })
  })
  var voucherCode
  lab.test('POST /admin/vouchers/generate', function(done) {
    request({
      method: 'POST',
      uri: appUrl + '/admin/vouchers/generate',
      json: true,
      headers: {
        'Authorization': adminToken
      },
      body: {
        amount: VOUCHER_AMOUNT,
        note: "This is an extended\nNOTE!"
      }
    }).spread(function(response, body) {
      expect(body, 'to have key', 'code')
      voucherCode = body.code

      done()
    }).catch(function(err) {
      console.log(err)
    })
  })
  lab.test('GET /admin/vouchers', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/admin/vouchers',
      json: true,
      headers: {
        'Authorization': adminToken
      }
    }).spread(function(response, body) {
      expect(response.statusCode, 'to be', 200)

      done()
    }).catch(function(err) {
      console.log(err)
    })
  })
  lab.test('GET /vouchers/', function(done) {
    request({
      method: 'GET',
      uri: appUrl + '/vouchers/' + voucherCode,
      json: true
    }).spread(function(response, body) {
      expect(body, 'to equal', {
        status: 'OK'
      })

      done()
    }).catch(function(err) {
      console.log(err)
    })
  })
  lab.test('POST /user/me/vouchers', function(done) {
    var creditBefore
    request({
      method: 'GET',
      uri: appUrl + '/users/me',
      json: true,
      headers: {
        'Authorization': token
      }
    }).spread(function(response, body) {
      creditBefore = body.credit
      
      return request({
        method: 'POST',
        uri: appUrl + '/users/me/vouchers',
        json: true,
        headers: {
          'Authorization': token
        },
        body: {
          code: voucherCode
        }
      })
    }).spread(function(response, body) {
      expect(body, 'to equal', {
        status: 'OK'
      })

      return request({
        method: 'POST',
        uri: appUrl + '/users/me/vouchers',
        json: true,
        headers: {
          'Authorization': token
        },
        body: {
          code: voucherCode
        }
      })
    }).spread(function(response, body) {
      expect(body.status, 'to equal', 'FAIL')

      return request({
        method: 'GET',
        uri: appUrl + '/users/me',
        json: true,
        headers: {
          'Authorization': token
        }
      })
    }).spread(function(response, body) {
      expect(body.credit-creditBefore, 'to equal', VOUCHER_AMOUNT)

      done()
    }).catch(function(err) {
      console.log(err)
    })
  })
})