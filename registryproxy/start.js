if(process.env.NODE_ENV === 'production') {
  require('newrelic')
}

var app = require('./express')

var port = 9500
app.listen(port, function() {
  console.log('Listening on port ' + port)
})
