var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient;

var server = new Hapi.Server();
server.connection({
    port: '8000'
});

console.log('Mode:', process.env.NODE_ENV);

var DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';


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

        MongoClient.connect(DATABASE_URL, function(err, db) {
            if(err) return console.log(err);

            var collection = db.collection('users');
            // Insert new user
            var email = request.payload.email;
            collection.insert({
                email: email,
                active: false,
                timestamp: Math.round(Date.now() / 1000)
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