var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient; // This should not be required as we should communicate with Mongo through backend API.

var server = new Hapi.Server();
server.connection({
    port: '8500'
});

var mapper = function (request, callback) {
    var url = 'mongodb://localhost:27017/blackbeard';

    // Use connect method to connect to the `
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('apps');

        var requestedCname = request.url.path.substr(1, request.url.path.length);

        collection.findOne({cname: requestedCname}, function(error, result) {
            var uri = '';
            if (result) {
                uri = "http://"+result.ip+":"+result.port;
            }
            
            callback(null, uri);
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