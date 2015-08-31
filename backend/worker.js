var Queue = require('./services/Queue')

Queue.connect().then(function () {
  console.log('Worker is running!')
})

Queue.consume('container', function (message, ack) {
  console.log(message.content.toString())
  ack()
})
