var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient; // This should not be required as we should communicate with Mongo through backend API.

var server = new Hapi.Server();
server.connection({
    port: '8500'
});

var handler = function (request, reply) {
    // Request backend
    var url = 'mongodb://localhost:27017/blackbeard';

    var Q = require('q');
    var deferred = Q.defer();

    // Use connect method to connect to the `
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('apps');
        var requestedCname = request.url.path.substr(1, request.url.path.length);

        collection.findOne({cname: requestedCname}, function(error, result) {
            var uri = "http://"+result.ip+":"+result.port;

            deferred.resolve(reply.proxy({ uri: uri, passThrough: true, xforward: true, timeout: 30000 }));
        })

    });

    return deferred.promise;
};

server.route({
    method: '*',
    path: '/{p*}',
    handler: handler
});

server.start(function() {
    console.log('Server running at:', server.info.uri);
});