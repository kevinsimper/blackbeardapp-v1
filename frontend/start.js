var app = require('./server')

var port = process.env.PORT || 9000
app.listen(port, function() {
  console.log('Frontend started listening on ' + port)
})
