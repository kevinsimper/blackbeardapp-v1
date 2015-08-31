var mongoose = require('mongoose')
var Promise = require('bluebird')
Promise.promisifyAll(require("mongoose"))
var config = require('./config')
var Queue = require('./services/Queue')

var mongo = mongoose.connect(config.DATABASE_URL)
var rabbitmq = Queue.connect()

Promise.all([mongo, rabbitmq]).then(function () {
  console.log('Worker is running!')

  Queue.consume('container-start', function (message, ack) {
    var ClusterService = require('./services/Cluster')
    var Container = require('./models/Container')

    var container = Container.findOne(message.containerId)
    var cluster = ClusterService.getCluster()
    var clusterContainerId = cluster.then(function (cluster) {
      return ClusterService.createContainer(cluster)
    })
    var started = Promise.all([cluster, clusterContainerId])
      .spread(function (cluster, clusterContainerId) {
        return ClusterService.startContainer(cluster, clusterContainerId)
      })

    var savedDetails = Promise.all([container, cluster, clusterContainerId, started])
      .spread(function (container, cluster, clusterContainerId, started) {
        container.cluster = cluster._id
        container.containerHash = clusterContainerId
        return container.save()
      })
      .then(function (container) {
        ack()
      })
      .catch(function (err) {
        if(process.env.NODE_ENV === 'production') {
          throw err
        } else {
          console.warn('No cluster attached', err.stack)
        }
      })
  })
})
