if(process.env.NODE_ENV === 'production') {
  require('newrelic')
}

var Promise = require('bluebird')
var _ = require('lodash')
var express = require('express')
var fs = Promise.promisifyAll(require('fs'))
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

app.get('/blog/', function (req, res) {
  res.send('ok')
})

app.get('/blog/:post', function (req, res) {
  var blogSlug = req.params.post
  fs.readFileAsync('./blog/data.json', 'utf8')
    .then(JSON.parse)
    .then(function (content) {
      var post = _.find(content.posts, {
        slug: blogSlug
      })
      return fs.readFileAsync('./blog/' + post.file + '.md', 'utf8')
    })
    .then(function (content) {
      res.render('blog/post', {
        post: content
      })
    })
    .catch(function (err) {
      res.send(500)
    })
})

var port = process.env.PORT || 9000
app.listen(port, function() {
  console.log('Frontend started listening on ' + port)
})
