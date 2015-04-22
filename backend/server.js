var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    passwordHash = require('password-hash');
 
var server = new Hapi.Server({ connections: { routes: { cors: true } } });
server.connection({ port: '8000' });

console.log('Mode:', process.env.NODE_ENV);

var DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('hello world');
    }
});

var front = require('./front.js');
front(server)

var user = require('./user.js')
user(server)

server.start(function() {
    console.log('Server running at:', server.info.uri);
});
