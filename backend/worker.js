var Queue = require('./services/Queue')

Queue.consume('container', function (message, ack) {
  console.log(message.content.toString())
  ack()
})
