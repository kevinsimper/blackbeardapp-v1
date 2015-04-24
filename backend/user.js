module.exports = function (server) {

    var MongoClient = require('mongodb').MongoClient,
        ObjectID = require('mongodb').ObjectID,
        passwordHash = require('password-hash');

    var LOCAL_DEV = true;
    if (LOCAL_DEV) {
        var DATABASE_URL = 'mongodb://localhost:27017/blackbeard'
    } else {
        var DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' + process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';
    }

    server.route({
        method: 'GET',
        path: '/admin/user',
        handler: function(request, reply) {
            MongoClient.connect(DATABASE_URL, function(err, db) {
                if (err) {
                    reply('An internal server error has occurred.').code(500)
                }

                var collection = db.collection('users_soon');

                var adminHash = request.query.admin;
                if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
                    reply('Invalid Admin Authorization Code.').code(401)
                    db.close()
                } else {
                    var userHash = request.query.userHash;

                    collection.findOne({
                        _id: ObjectID(userHash)
                    }, function(err, user) {
                        if (err) {
                            reply('Internal server error.').code(500)
                        } else {
                            if (user) {
                                reply({email: user.email, timestamp: user.timestamp});
                            } else {
                                reply('User not found.').code(404)
                            }
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
                if (err) {
                    reply('An internal server error has occurred.').code(500)
                }

                var collection = db.collection('users_soon');

                var adminHash = request.payload.admin;
                if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
                    reply('Invalid Admin Authorization Code.').code(401)

                    db.close()
                } else {
                    var userHash = request.payload.userHash;
                    var email = request.payload.email;
                    var password = request.payload.password;

                    collection.findOne({
                        _id: ObjectID(userHash)
                    }, function(err, user) {
                        if (err) {
                            reply('Internal server error.').code(500)

                            db.close()
                        } else {
                            var hashedPassword = passwordHash.generate(password);

                            if (user) {
                                collection.update(
                                    {_id: ObjectID(userHash)},
                                    { $set: { email: email } },
                                    function(err, result) {
                                        if (err) {
                                            reply('Internal server error.').code(500)
                                        } else {
                                            reply('User successfully updated.').code(404)
                                        }

                                        db.close();
                                    }
                                )
                            } else {
                                reply('User not found.').code(404)

                                db.close();
                            }
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
                if (err) {
                    reply('An internal server error has occurred.').code(500)
                }

                var collection = db.collection('users_soon');

                var adminHash = request.payload.admin;
                if (adminHash != 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
                    reply('Invalid admin authorization code.').code(401)
                    db.close()
                } else {
                    var userHash = request.payload.userHash;

                    collection.remove({
                        _id: ObjectID(userHash)
                    }, function(err, count) {
                        if (err) {
                            reply('An error has occurred while removing the user.').code(500)
                        } else {
                             if (count) {
                                 reply('User successfully updated.').code(200)
                             } else {
                                reply('User not found.').code(404)
                             }
                        }
                        db.close()
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
                if (err) {
                    reply('An internal server error has occurred.').code(500)
                }

                var collection = db.collection('users_soon');

                var email = request.payload.email;
                var password = request.payload.password;
                var hashedPassword = passwordHash.generate(password);

                var insertCallback = function(err, result) {
                    if (err) {
                        reply('An internal server error has occurred').code(500)
                    } else {
                        reply('User successfully added.').code(200)
                    }

                    db.close() // Replace this with the user of a promise
                };

				var resultCallback = function(err, user) {
                    if (err) {
                        reply('An error has occurred while removing the user.').code(500)
                        db.close();
                    } else {
                        if (user) {
                            reply('A user account with this email address already exists.').code(187)
                            db.close() // Replace this with the user of a promise
                        } else {
                            collection.insert({
                                email: email,
                                password_hashed: hashedPassword,
                                timestamp: Math.round(Date.now() / 1000)
                            }, insertCallback);
                        }
                    }
                }

				collection.findOne({
                    email: email
                }, resultCallback);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/login',
        handler: function(request, reply) {
            MongoClient.connect(DATABASE_URL, function(err, db) {
                if (err) {
                    reply('An internal server error has occurred.').code(500)
                }

                var collection = db.collection('users_soon');

                var email = request.payload.email;
                var password = request.payload.password;

                collection.findOne({
                    email: email
                }).toArray(function(err, user) {
                    if (user) {
                        if (passwordHash.verify(password, user.password_hashed)) {
                            reply('Login successful.').code(200)
                        } else {
                            reply('Invalid email and password combination.').code(215)
                        }
                    } else {
                        reply('Invalid email and password combination.').code(215)
                    }

                    db.close();
                  });
            });
        }
    });
}