var os = require('os');
var readline = require('readline');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push({name: k, address: address.address});
        }
    }
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Who are you?");
addresses.forEach(function (address, i) {
  console.log(i + ") " + address.name + " - " + address.address)
})

var removeClustersDoc = function (address) {
  console.log("Removing clusters document")
  child = exec('mongo blackbeard --eval "db.clusters.drop()"', function (error, stdout, stderr) {
    console.log("SUCCESSFUL")
    console.log("")
    console.log("Don't forget to:")
    console.log("    - Edit your swarm/post.js")
    console.log("    - From swarm directory run `docker-machine env swarm-master | docker-machine-export | node post.js`")
    console.log("    - Edit backend/fixtures/cluster.js to contain the new cluster object")
    console.log("    - Run `docker-compose run backend npm run test-cluster`")
  })
}

var fixHosts = function (address) {
  console.log("Setting address to " + address)
  var fixHosts = spawn('sh', [ 'swarm/fixhostsfile.sh', address ])

  fixHosts.on('close', function (code) {
    removeClustersDoc()
  })
}

var preup = function(address) {
  var preUp = spawn('sh', [ 'swarm/preup.sh' ])

  preUp.stdout.on('data', function (data) {
    console.log(""+ data);
  })

  preUp.on('close', function (code) {
    if (code === 0) {
      fixHosts(address)
    }
  })
}

var stopRunning = function (name, address) {
  console.log("Stopping "+name)
  var run = spawn('docker-machine', ['rm', name ])

  run.on('close', function (code) {
    return preup(address)
  })
}

rl.question("", function(answer) {
  console.log("Using:", addresses[answer]);

  var getCurrent = spawn('docker-machine', ['ls' ])

  getCurrent.stdout.on('data', function (data) {
    //data.match(/swarm-master/)
    var dataStr = data+''
    if (dataStr.match(/swarm-master/)) {
      // Stop swarm-master before starting preup
      stopRunning('swarm-master', addresses[answer].address)
    } else {
      preup(addresses[answer].address)
    }
  })

  rl.close();
});
