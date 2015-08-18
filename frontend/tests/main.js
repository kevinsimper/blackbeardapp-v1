var Lab = require('lab')
var lab = exports.lab = Lab.script()
var expect = require('unexpected')
var fs = require('fs')
var request = require('request')
var app = require('../server')

var port = 9000
app.listen(port, function() {
  console.log('Frontend started listening on ' + port)
})

lab.test('javascript files should be compiled', function (done) {
  fs.readdir(__dirname + '/../public/build', function(err, files) {
    expect(files, 'to contain', 
      'blog.css',
      'bundle.js',
      'controlpanel.css',
      'controlpanel.js',
      'main.css',
      'main.scss')
    done()
  })
})

lab.test('server should respond with a 200', function (done) {
  request.get('http://localhost:9000', function (err, response, body) {
    expect(response.statusCode, 'to be', 200)
    done()
  })
})

