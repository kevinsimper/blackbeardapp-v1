module.exports.admin = function (server) {

	var MongoClient = require('mongodb').MongoClient,
	    ObjectID = require('mongodb').ObjectID,
	    passwordHash = require('password-hash');

	var DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';

	server.route({
	    method: 'GET',
	    path: '/admin/user',
	    handler: function(request, reply) {
	        MongoClient.connect(DATABASE_URL, function(err, db) {
	            if(err) return console.log(err);

	            var collection = db.collection('users_soon');

	            var adminHash = request.query.admin;
	            if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
	                reply('invalid_admin_hash')
	            } else {
	                var userHash = request.query.userHash;

	                collection.find({
	                    _id: ObjectID(userHash)
	                }).toArray(function(err, docs) {
	                	reply(docs)
	                });
	            }
	        });
	    }
	});

	server.route({
	    method: 'PUT',
	    path: '/admin/user',
	    handler: function(request, reply) {
	        MongoClient.connect(DATABASE_URL, function(err, db) {
	            if(err) return console.log(err);

	            var collection = db.collection('users_soon');

	            var adminHash = request.payload.admin;
	            if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
	                reply('invalid_admin_hash')
	            } else {
	                var userHash = request.payload.userHash;
	                var email = request.payload.email;
	                var password = request.payload.password;

	                collection.find({
	                    _id: ObjectID(userHash)
	                }).toArray(function(err, docs) {
	                    if (docs.length > 0) {
	                        var user = docs[0];
	                        var hashedPassword = passwordHash.generate(password);

	                        collection.update(
	                            {_id: ObjectID(userHash)},
	                            { $set: { email: email } },
	                            function(err, result) {
	                                if (err) {
	                                    reply(result)
	                                } else {
	                                    reply('ok')
	                                }

	                    			db.close();

	                            }
	                        );
	                    } else {
	                        reply('user_not_found');
	                    }

	                });
	            }

	            
	        });
	    }
	});

}