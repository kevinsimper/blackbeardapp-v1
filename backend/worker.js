var mongoose = require('mongoose')
var Promise = require('bluebird')
Promise.promisifyAll(require("mongoose"))
var config = require('./config')
var Queue = require('./services/Queue')

var mongo = mongoose.connect(config.DATABASE_URL)
var rabbitmq = Queue.connect()

Promise.all([mongo, rabbitmq]).then(function () {
  console.log('Worker is running!!')

  Queue.consume('container-start', function (message, ack) {
    var ClusterService = require('./services/Cluster')
    var Container = require('./models/Container')
    var App = require('./models/App')
    var Image = require('./models/Image')
    var User = require('./models/User')
    var sequest = require('sequest')

    var container = Container.findOne({_id: message.containerId})

    var cluster = ClusterService.getCluster()
    var app = container.then(function(container) {

      return App.findOne({_id: container.app})
    })
    var user = app.then(function (app) {
      return User.findOne({_id: app.user})
    })
    var image = app.then(function(app) {
      return Image.findOne({_id: app.image}).then(function(image) {
        return image
      })
    })

    var registry = 'registry.blackbeard.dev:9500'
    var pullImage = Promise.all([cluster, image, user]).spread(function (cluster, image, user) {
      var fullPath = registry + '/' + user.username + '/' + image.name
      console.log('pull path', fullPath)
      return new Promise(function (resolve, reject) {
        sequest('docker@' + cluster.ip, {
          command: 'docker login -u blackbeard -p password -e kevin.simper@gmail.com registry.blackbeard.dev:9500 && docker pull ' + fullPath,
          privateKey: cluster.certificates.sshPrivate
        }, function (err, stdout) {
          console.log(err)
          console.log(stdout)
          resolve(stdout)
        })
      })
    })

    var clusterContainerId = Promise.all([cluster, user, image, pullImage]).spread(function (cluster, user, image, pullImage) {
      return ClusterService.createContainer(cluster, registry + '/' + user.username + '/' + image.name + ':latest')
    })

    var containerInfo = Promise.all([cluster, clusterContainerId]).spread(function (cluster, clusterContainerId) {
      return ClusterService.lookupContainer(cluster, clusterContainerId)
    })

    var started = Promise.all([cluster, clusterContainerId])
      .spread(function (cluster, clusterContainerId) {
        return ClusterService.startContainer(cluster, clusterContainerId)
      })

    var savedDetails = Promise.all([container, cluster, clusterContainerId, started, containerInfo])
      .spread(function (container, cluster, clusterContainerId, started, containerInfo) {
        var ports = containerInfo.NetworkSettings.Ports

        if (ports === null) {
          throw new Promise.OperationalError('No container connection details found.')
        }
        var portKeys = Object.keys(containerInfo.NetworkSettings.Ports).reverse()

        container.ip = ports[portKeys[0]][0].HostIp,
        container.port = ports[portKeys[0]][0].HostPort
        container.cluster = cluster._id
        container.containerHash = clusterContainerId


        return container.save()
      })
      .then(function (container) {
        ack()
      })
      .error(function(err) {
        console.warn('No cluster attached', err.stack)
      })
      .catch(function (err) {
        if(process.env.NODE_ENV === 'production') {
          throw err
        } else {
          console.warn('No cluster attached', err.stack)
        }
      })
  })

  Queue.consume('container-kill', function (message, ack) {
    var ClusterService = require('./services/Cluster')
    var Container = require('./models/Container')
    var App = require('./models/App')
    var Image = require('./models/Image')
    var User = require('./models/User')
    var sequest = require('sequest')

    // TODO: Choose proper cluster here
    var cluster = ClusterService.getCluster()

    var clusterContainerId = message.containerId
    var container = Container.findOne({_id: clusterContainerId})

    cluster.then(function(cluster) {
      ClusterService.killContainer(cluster, clusterContainerId)
      .then(function(result) {
        ack()
      })
      .error(function(err) {
        console.warn(err, err.stack)
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
})
