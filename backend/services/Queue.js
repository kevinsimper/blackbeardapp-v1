var amqplib = require('amqplib')
var Promise = require('bluebird')
var config = require('../config')
var debug = require('debug')('queue')


var connection = null

exports.connect = function () {
  return new Promise(function (resolve) {
    if(connection) {
      resolve(connection)
      return
    }
    connection = amqplib.connect(config.RABBITMQ_URL)
    resolve(connection)
  })
}

/**
* @params {string} queue
* @params {string} message
*/
exports.send = function (queue, message) {
  var connection = this.connect().then(function (connection) {
    return connection.createConfirmChannel()
  })
  connection.then(function (channel) {
    channel.assertQueue(queue)
    channel.sendToQueue(queue, new Buffer(JSON.stringify(message)), {}, function () {
      channel.close()
    })
    return channel
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
      var start = Date.now()
      var ackCallback = function (channel, message) {
        return function () {
          channel.ack(message)
          debug(queue, 'Job finished!', (Date.now() - start) / 1000 + ' sec')
        }
      }
      var json = JSON.parse(message.content.toString())
      debug(queue, 'Job started', json)
      callback(json, ackCallback(channel, message))
    })
  })
}
