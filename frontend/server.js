require('newrelic')

var express = require('express');
var harp = require('harp');
var app = express();

var BACKEND_HOST = process.env.BACKEND_HOST;

app.use(harp.mount(__dirname + '/public'));

var port = process.env.PORT || 9000
app.listen(port, function() {
  console.log('Frontend started listening on ' + port);
});