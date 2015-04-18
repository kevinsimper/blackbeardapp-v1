var express = require('express');
var harp = require('harp');
var app = express();

app.use(harp.mount(__dirname + '/public'));

var port = process.env.PORT || 9000
app.listen(port, function() {
  console.log('Frontend started listening on ' + port);
});