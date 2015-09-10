var request = require('request')
var iron_worker = require('iron_worker')
var params = iron_worker.params()

var token = (params !== null) ? params.token : process.env.TOKEN

request({
  url: 'https://api.blackbeard.io/billing',
  headers: {
    'User-Agent': 'iron.io',
    'Authorization': token
  }
}, function (err, response, body) {
  if(err) {
    console.log(err)
  }
  console.log(body)
})
