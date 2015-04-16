// Script to populate mongo with test data

var url = 'mongodb://localhost:27017/blackbeard'
var MongoClient = require('mongodb').MongoClient,
	ObjectId = require('mongodb').ObjectID

var users = [
	{ "email" : "jambroo@gmail.com", "active" : false, "timestamp" : 1426425670578, "_id" : ObjectId("550587461664e62663ebd5e3") }
]

var apps = [
	{ "_id" : ObjectId("5505899b26f219092aad7311"), "cname" : "jambroo", "ip" : "173.255.221.154", "port" : 80, "active" : true, "user_id" : ObjectId("550587461664e62663ebd5e3") },
	{ "_id" : ObjectId("5505899b26f219092aad7312"), "cname" : "imgur", "ip" : "23.235.43.193", "port" : 80, "active" : true, "user_id" : ObjectId("550587461664e62663ebd5e3") }
]

MongoClient.connect(url, function(err, db) {
	console.log("Adding users")
	var collection = db.collection('users')
	collection.insert(users, function(err, records) {
		if (err) throw err

		console.log("Adding apps")
		var appsCollection = db.collection('apps')
		appsCollection.insert(apps, function(err, records) {
			if (err) throw err
			console.log('Done.')
			db.close()
		})
	})
})