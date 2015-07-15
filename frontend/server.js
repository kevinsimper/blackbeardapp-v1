if(process.env.NODE_ENV === 'production') {
  require('newrelic')
}

var express = require('express')
var app = express()

var BACKEND_HOST = process.env.BACKEND_HOST

app.set('view engine', 'jade')
app.set('views', './views')
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.render('index')
})

app.get('/controlpanel', function(req, res) {
  res.render('controlpanel/index')
})

var port = process.env.PORT || 9000
app.listen(port, function() {
  console.log('Frontend started listening on ' + port)
})
