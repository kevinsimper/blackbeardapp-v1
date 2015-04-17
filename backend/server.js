var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient;

var server = new Hapi.Server({ connections: { routes: { cors: true } } });
server.connection({ port: '8000' });

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('hello world');
    }
});

server.route({
    method: 'POST',
    path: '/signup',
    handler: function(request, reply) {
        var url = 'mongodb://localhost:27017/blackbeard';

        // Use connect method to connect to the `
        MongoClient.connect(url, function(err, db) {
            var collection = db.collection('users');
            // Insert new user
            var email = request.payload.email;
            collection.insert({
                email: email,
                active: false,
                timestamp: Math.round(Date.now()/1000)
            }, function(err, result) {
                if (err) {
                    reply('error').code(500)
                } else {
                    reply('ok')
                }
                
                db.close();
            });
        });
    }
});



server.start(function() {
    console.log('Server running at:', server.info.uri);
});