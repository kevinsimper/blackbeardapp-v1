if(process.env.NODE_ENV === 'production') {
  // Uses these two ENV variables
  // NEW_RELIC_APP_NAME
  // NEW_RELIC_LICENSE_KEY
  require('newrelic')
}

var mongoose = require('mongoose')
var _ = require('lodash')
var Promise = require('bluebird')
Promise.promisifyAll(require("mongoose"))
var config = require('./config')
var Queue = require('./services/Queue')
var request = Promise.promisify(require('request'))

var mongo = mongoose.connect(config.DATABASE_URL)
var rabbitmq = Queue.connect()

Promise.all([mongo, rabbitmq]).then(function () {
  console.log('Worker is running!!')

  Queue.consume('container-start', function (message, ack) {
    var ClusterService = require('./services/Cluster')
    var Container = require('./models/Container')
    var Cluster = require('./models/Cluster')
    var App = require('./models/App')
    var Image = require('./models/Image')
    var User = require('./models/User')
    var sequest = require('sequest')

    var container = Container.findOne({_id: message.containerId})
      .then(function (container) {
        if(!container) {
          throw new Promise.OperationalError('no-container')
        }
        return container
      })

    var cluster = ClusterService.getCluster().then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('no-cluster')
      }
      return cluster
    })
    var app = container.then(function(container) {
      return App.findOne({_id: container.app})
    }).then(function (app) {
      if(!app) {
        throw new Promise.OperationalError('no-app')
      }
      return app
    })
    var user = app.then(function (app) {
      return User.findOne({_id: app.user})
    }).then(function (user) {
      if(!user) {
        throw new Promise.OperationalError('no-user')
      }
      return user
    })
    var image = app.then(function(app) {
      return Image.findOne({_id: app.image}).then(function(image) {
        return image
      })
    }).then(function (image) {
      if(!image) {
        throw new Promise.OperationalError('no-image')
      }
      return image
    })

    var registry = config.REGISTRY_URL
    var pullImage = Promise.all([cluster, image, user]).spread(function (cluster, image, user) {
      var fullPath = registry + '/' + user.username + '/' + image.name
      console.log('pull path', fullPath)
      return new Promise(function (resolve, reject) {
        sequest(cluster.certificates.sshUser + '@' + cluster.ip, {
          command: 'docker login -u worker -p ' + config.WORKER_PASSWORD + ' -e kevin.simper@gmail.com ' + registry + ' && docker pull ' + fullPath,
          privateKey: cluster.certificates.sshPrivate
        }, function (err, stdout) {
          if(err) {
            console.log(err)
            reject(err)
          }
          console.log(stdout)
          resolve(stdout)
        })
      })
    })

    var clusterContainerId = Promise.all([cluster, user, image, pullImage, app]).spread(function (cluster, user, image, pullImage, app) {
      var imagePath = registry + '/' + user.username + '/' + image.name + ':latest'
      console.log('image to start', image)
      return ClusterService.createContainer(cluster, imagePath, app).then(function(clusterContainerId) {
        console.log('clusterContainerId', clusterContainerId)
        return clusterContainerId
      })
    })

    var started = Promise.all([cluster, clusterContainerId])
      .spread(function (cluster, clusterContainerId) {
        return ClusterService.startContainer(cluster, clusterContainerId).then(function(started) {
          console.log('started', started)
          return started
        })
      })

    var containerInfo = Promise.all([cluster, clusterContainerId, started]).spread(function (cluster, clusterContainerId) {
      return ClusterService.lookupContainer(cluster, clusterContainerId).then(function (containerInfo) {
        console.log('containerInfo', containerInfo)
        return containerInfo
      })
    })

    var savedContainer = Promise.all([container, cluster, clusterContainerId, started, containerInfo, image])
      .spread(function (container, cluster, clusterContainerId, started, containerInfo, image) {
        var ports = containerInfo.NetworkSettings.Ports

        if (ports === null) {
          throw new Promise.OperationalError('No container connection details found.')
        }
        var portKeys = Object.keys(containerInfo.NetworkSettings.Ports).reverse()

        container.status = Container.status.UP
        container.ip = cluster.ip
        container.port = ports[portKeys[0]][0].HostPort
        container.availablePorts = _.map(portKeys, function(port) {
          return port.split("/")[0]
        })
        container.cluster = cluster._id
        container.containerHash = clusterContainerId
        container.dockerContentDigest = image.dockerContentDigest

        return container.save()
    })

    savedContainer.then(function() {
      ack()
    })
    .error(function(err) {
      console.warn(err.stack)
      switch(err.message) {
        case 'no-container':
          ack()
          break;
        case 'no-cluster':
        case 'no-app':
        case 'no-user':
        case 'no-image':
          container.then(function (container) {
            container.status = Container.status.FAILED
            return container.save()
          }).then(function () {
            ack()
          })
          break;
      }
    })
    .catch(function (err) {
      console.warn(err.stack)
    })
  })

  Queue.consume('container-kill', function (message, ack) {
    var ClusterService = require('./services/Cluster')
    var Container = require('./models/Container')
    var Cluster = require('./models/Cluster')
    var App = require('./models/App')
    var Image = require('./models/Image')
    var User = require('./models/User')

    var container = Container.findOne({_id: message.containerId}).then(function (container) {
      if(!container) {
        throw new Promise.OperationalError('no-container')
      }
      return container
    })

    var cluster = container.then(function (container) {
      return Cluster.findOne({_id: container.cluster})
    }).then(function (cluster) {
      if(!cluster) {
        throw new Promise.OperationalError('no-cluster')
      }
      return cluster
    })

    Promise.all([cluster, container]).spread(function(cluster, container) {
      return ClusterService.removeContainer(cluster, container.containerHash).catch(function (err) {
        // It properbly did not exist anymore.
        return 'Could not remove container'
      })
    }).then(function(result) {
      ack()
    }).error(function(err) {
      console.warn(err.stack)
      switch(err.message) {
        case 'no-container':
        case 'no-cluster':
          ack()
          break;
      }
    }).catch(function (err) {
      if(process.env.NODE_ENV === 'production') {
        throw err
      } else {
        console.warn('No cluster attached', err.stack)
      }
    })
  })

  Queue.consume('image-redeploy', function (message, ack) {
    var Image = require('./models/Image')
    var App = require('./models/App')
    var Container = require('./models/Container')
    var ClusterService = require('./services/Cluster')
    var cluster = ClusterService.getCluster()
    var config = require('./config')
    var _ = require('lodash')

    var image = Image.findOne({_id: message.image})

    image.then(function (image) {
      console.log('image', image.dockerContentDigest)
    })

    var apps = image.then(function (image) {
      return App.find({image: image._id}).populate('containers')
    })

    var adminToken = config.ADMIN_TOKEN

    var deletedAppsContainers = Promise.all([apps, adminToken]).spread(function (apps, adminToken) {
      return Promise.map(apps, function (app) {
        var activeContainers = _.filter(app.containers, {deleted: false}) || []
        return Promise.map(activeContainers, function (container) {
          var url = config.BACKEND_URL + '/users/' + app.user + '/apps/' + app._id + '/containers/' + container._id
          console.log(url)
          return request({
            method: 'DELETE',
            uri: url,
            json: true,
            headers: {
              Authorization: adminToken
            }
          }).spread(function (response, body) {
            return body
          })
        })
      })
    })

    var containers = Promise.all([apps, adminToken, deletedAppsContainers]).spread(function (apps, adminToken, deletedAppsContainers) {
      console.log(deletedAppsContainers)
      // this will loop over every app that is connected to the image
      return Promise.map(apps, function (app, index) {
        // will create the same amount of containers that was deleted
        // if we deleted two containers, there should be created two containers
        console.log(deletedAppsContainers[index])
        Promise.map(deletedAppsContainers[index], function() {
          var url = config.BACKEND_URL + '/users/' + app.user + '/apps/' + app._id + '/containers'
          console.log(url)
          return request({
            method: 'POST',
            uri: url,
            json: true,
            headers: {
              Authorization: adminToken
            }
          }).spread(function (response, body) {
            return body
          })
        })
      })
    })

    containers.then(function (containers) {
      ack()
    }).catch(function (err) {
      console.log(err)
    })

  })
})
