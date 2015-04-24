module.exports = function (server) {

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
	                reply('Invalid Admin Authorization Code.').code(401)
	            } else {
	                var userHash = request.query.userHash;

	                collection.findOne({
	                    _id: ObjectID(userHash)
	                }, function(err, document) {
	                	if (err) {
	                		reply('user_not_found')
	                	} else {
	                		reply({email: document.email, timestamp: document.timestamp});
	                	}

	                	db.close()
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
	                reply('Invalid Admin Authorization Code.').code(401)

	            } else {
	                var userHash = request.payload.userHash;
	                var email = request.payload.email;
	                var password = request.payload.password;

					collection.findOne({
	                    _id: ObjectID(userHash)
	                }, function(err, user) {
	                	if (err) {
	                		reply('user_not_found')
	                	} else {
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
	                        )
	                	}
					});
	            }
	        });
	    }
	});

	server.route({
	    method: 'DELETE',
	    path: '/admin/user',
	    handler: function(request, reply) {
	        MongoClient.connect(DATABASE_URL, function(err, db) {
	            if(err) return console.log(err);

	            var collection = db.collection('users_soon');

	            var adminHash = request.payload.admin;
	            if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
	                reply('Invalid admin authorization code.').code(401)
	            } else {
	                var userHash = request.payload.userHash;

					collection.remove({
	                    _id: ObjectID(userHash)
	                }, function(err, count) {
	                	if (err) {
	                		reply('An error has ocurred while removing the user.').code(500)
	                	} else {
	                     	if (count) {
	                     		reply('User successfully updated.').code(200)
	                     	} else {
	                			reply('User not found.').code(404)
	                     	}
	                	}
					});
	            }
	        });
	    }
	});

	server.route({
	    method: 'POST',
	    path: '/user',
	    handler: function(request, reply) {
	        MongoClient.connect(DATABASE_URL, function(err, db) {
	            if(err) return console.log(err);

	            var collection = db.collection('users_soon');

                var email = request.payload.email;
                var password = request.payload.password;
	            var hashedPassword = passwordHash.generate(password);

				collection.findOne({
                    email: email
                }, function(err, user) {
                	if (err) {
         		    reply('An error has ocurred while removing the user.').code(500)
                	} else {
						if (user) {
                        	reply('user_already_exists')
                        } else {
                        	collection.insert({
				                email: email,
				                password_hashed: hashedPassword,
				                timestamp: Math.round(Date.now() / 1000)
				            }, function(err, result) {
				                if (err) {
				                    reply('error').code(500)
				                } else {
				                    reply('ok')
				                }

				                db.close();
				            });
                        }
                	}
				});
	        });
	    }
	});

	server.route({
	    method: 'POST',
	    path: '/login',
	    handler: function(request, reply) {
	        MongoClient.connect(DATABASE_URL, function(err, db) {
	            if(err) return console.log(err);

	            var collection = db.collection('users_soon');

	            var email = request.payload.email;
	            var password = request.payload.password;

	            collection.find({
	                email: email
	            }).toArray(function(err, docs) {
	                if (docs.length > 0) {
	                    var user = docs[0];

	                    if (passwordHash.verify(password, user.password_hashed)) {
	                        reply('ok')
	                    } else {
	                        reply('incorrect').code(500);
	                    }                    
	                } else {
	                    reply('incorrect').code(500);
	                }

	                db.close();
	              });
	        });
	    }
	});
}
