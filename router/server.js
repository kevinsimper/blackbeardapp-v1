var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient; // This should not be required as we should communicate with Mongo through backend API.

var server = new Hapi.Server();
server.connection({
    port: '8500'
});

// Had to add hosts file entry to test this as:
// 88.80.187.61 jambroo.dev.jambroo.com
// TODO: Register domain and handle subdomains properly

var mapper = function (request, callback) {
    var requestedHostname = request.info.host;
    var requestedHostnameSplit = requestedHostname.split('.');
    if (requestedHostnameSplit && requestedHostnameSplit.length) {
        var requestedCname = requestedHostnameSplit[0];
    } else {
        throw 'No subdomain in request.';
    }

    var url = 'mongodb://localhost:27017/blackbeard';

    // Use connect method to connect to the `
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('apps');

        collection.findOne({cname: requestedCname}, function(error, result) {
            if (result) {
                var uri = "http://"+result.ip+":"+result.port;
                callback(null, uri);
            } else {
                throw 'No app found matching CNAME.';
            }
        })
    });
}

server.route({
    method: '*',
    path: '/{p*}',
    handler: { proxy: { mapUri: mapper } }
});

server.start(function() {
    console.log('Server running at:', server.info.uri);
});