var amqplib = require('amqplib')
var Promise = require('bluebird')

var connect = function () {
  var url = 'amqp://' + process.env.RABBITMQ_PORT.replace('tcp://', '')
  console.log('url', url)
  return amqplib.connect(url)
}

/**
* @params {string} queue
* @params {string} message
*/
exports.send = function (queue, message) {
  return connect().then(function (connection) {
    return connection.createChannel()
  }).then(function (channel) {
    channel.assertQueue(queue)
    return channel.sendToQueue(queue, new Buffer(message))
  })
}

exports.consume = function (queue, callback) {
  return connect().then(function (connection) {
    return connection.createChannel()
  }).then(function (channel) {
    channel.assertQueue(queue)
    channel.consume(queue, function (message) {
      var ackCallback = function (channel, message) {
        return function () {
          channel.ack(message)
        }
      }
      callback(message, ackCallback(channel, message))
    })
  })
}
