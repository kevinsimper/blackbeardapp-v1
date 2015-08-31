var amqplib = require('amqplib')
var Promise = require('bluebird')
var config = require('../config')

exports.connect = function () {
  return amqplib.connect(config.RABBITMQ_URL)
}

/**
* @params {string} queue
* @params {string} message
*/
exports.send = function (queue, message) {
  return this.connect().then(function (connection) {
    return connection.createChannel()
  }).then(function (channel) {
    channel.assertQueue(queue)
    return channel.sendToQueue(queue, new Buffer(message))
  })
}

exports.consume = function (queue, callback) {
  return this.connect().then(function (connection) {
    return connection.createChannel()
  }).then(function (channel) {
    channel.assertQueue(queue, {
      durable: true
    })
    channel.prefetch(1)
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
