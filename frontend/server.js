if(process.env.NODE_ENV === 'production') {
  require('newrelic')
}

var Promise = require('bluebird')
var _ = require('lodash')
var express = require('express')
var fs = Promise.promisifyAll(require('fs'))
var app = express()
var marked = require('marked')

var BACKEND_HOST = process.env.BACKEND_HOST

app.set('view engine', 'jade')
app.set('views', './views')
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.render('index', {
    NODE_ENV: process.env.NODE_ENV
  })
})

app.get('/signup', function (req, res) {
  res.render('signup', {
    NODE_ENV: process.env.NODE_ENV
  })
})

app.get('/controlpanel', function(req, res) {
  res.render('controlpanel/index', {
    NODE_ENV: process.env.NODE_ENV
  })
})

app.get('/blog/', function (req, res) {
  var blogSlug = req.params.post
  fs.readFileAsync('./blog/data.json', 'utf8')
    .then(JSON.parse)
    .then(function (content) {
      var metaposts = content.posts.reverse()
      var posts = metaposts.map(function (post) {
        return fs.readFileAsync('./blog/' + post.file + '.md', 'utf8').then(marked)
      })
      var olderPosts = []
      metaposts.forEach(function (post, i) {
        if(i !== 0) {
          olderPosts.push(_.pick(post, ['slug', 'title', 'date']))
        }
      })
      Promise.all(posts).then(function (posts) {
        res.render('blog/index', {
          meta: content.posts,
          posts: posts,
          olderPosts: olderPosts
        })
      })
    })
    .catch(function (err) {
      console.log(err)
      res.sendStatus(500)
    })
})

app.get('/blog/:post', function (req, res) {
  var blogSlug = req.params.post
  var meta = fs.readFileAsync('./blog/data.json', 'utf8')
    .then(JSON.parse)
    .then(function (content) {
      var post = _.find(content.posts, {
        slug: blogSlug
      })
      return post
    })

  var post = meta.then(function (meta) {
    return fs.readFileAsync('./blog/' + meta.file + '.md', 'utf8')
  }).then(marked)

  Promise.all([meta, post])
    .spread(function (meta, post) {
      res.render('blog/post', {
        post: post,
        meta: meta
      })
    })
    .catch(function (err) {
      res.send(500)
    })
})

module.exports = app
