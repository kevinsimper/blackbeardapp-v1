var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    passwordHash = require('password-hash');
 
var server = new Hapi.Server({ connections: { routes: { cors: true } } });
server.connection({ port: '8000' });

if (!process.env.DB_PORT_27017_TCP_ADDR) {
    process.env.DB_PORT_27017_TCP_ADDR = 'localhost';
    process.env.DB_PORT_27017_TCP_PORT = 27017;
}

//var DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';
var DATABASE_URL = 'mongodb://db.blackbeard.io:27017/blackbeard';

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('hello world');
    }
});

var front = require('./front.js');
front(server, DATABASE_URL)

var user = require('./user.js')
user(server, DATABASE_URL)

server.start(function() {
    console.log('Server running at:', server.info.uri);
});
