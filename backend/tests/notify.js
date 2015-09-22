var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Promise = require('bluebird')
var expect = require('unexpected')
var Notify = require('../services/Notify')

var server = require('../startdev')()

lab.experiment('Notify', function() {
  lab.test('admins', function (done) {
    Notify.notifyAdmins().then(function () {
      done()
    })
  })
})
