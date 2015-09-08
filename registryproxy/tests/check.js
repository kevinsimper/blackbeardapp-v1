var expect = require('unexpected')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var check = require('../check')

lab.experiment('check path', function () {
  lab.test('get ping /v2/ as kevinsimper', function (done) {
    var user = 'kevinsimper'
    var path = '/v2/'
    check.checkPath(user, path).then(function (allowed) {
      expect(allowed, 'to be', true)
      done()
    }).catch(function (err) {
      console.log(err)
    })
  })
  lab.test('get ping /v2/ as blackbeard', function (done) {
    var user = 'blackbeard'
    var path = '/v2/'
    check.checkPath(user, path).then(function (allowed) {
      expect(allowed, 'to be', true)
      done()
    }).catch(function (err) {
      console.log(err)
    })
  })
})

lab.experiment('test image path', function () {
  lab.test('allowed', function (done) {
    var user = 'kevinsimper'
    var path = '/v2/kevinsimper/mynginx/'
    check.checkPath(user, path).then(function (allowed) {
      expect(allowed, 'to be', true)
      done()
    }).catch(function (err) {
      console.log(err)
    })
  })
  lab.test('disallowed', function (done) {
    var user = 'blackbeard'
    var path = '/v2/kevinsimper/mynginx/'
    check.checkPath(user, path).then(function () {
      // should never be called
      expect(true, 'to be', false)
    }).catch(function (err) {
      expect(err, 'to have message', 'Path forbidden!');
      done()
    })
  })
  lab.test('empty as correct user', function (done) {
    var user = 'kevinsimper'
    var path = '/v2/kevinsimper//'
    check.checkPath(user, path).then(function () {
      // should never be called
      expect(true, 'to be', false)
    }).catch(function (err) {
      expect(err, 'to have message', 'You have to specify a image name!');
      done()
    })
  })
  lab.test('empty as incorrect user', function (done) {
    var user = 'blackbeard'
    var path = '/v2/kevinsimper//'
    check.checkPath(user, path).then(function () {
      // should never be called
      expect(true, 'to be', false)
    }).catch(function (err) {
      expect(err, 'to have message', 'Path forbidden!');
      done()
    })
  })
})
