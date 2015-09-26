use blackbeard;
db.preusers.insert({
  "_id": ObjectId("559396bf05974b0c00b6b283"),
  "email": "admin+signup@blackbeard.io",
  "active": false,
  "timestamp": "1435735743",
  "ip": "127.0.0.1",
  "__v": 0
});
db.creditcards.insert({
  "_id" : ObjectId("55b63553ec5d482b005cfbc6"),
  "deleted" : false,
  "name" : "Test Creditcard",
  "token" : "tok_6gZ0ryDPjVxQdO",
  "number" : "1234",
  "active": true,
  "brand" : "Visa",
  "__v" : 0
})
db.users.insert({
  "_id": ObjectId("559396be05974b0c00b6b281"),
  "email": "admin@blackbeard.io",
  "password": "sha1$5474e86b$1$0d184fe27ec8573b8f34cf5b33e9a7a237fe5b27",
  "name": "Blackbeard",
  "username": "blackbeard",
  "credit": 1000,
  "virtualCredit": 1000,
  "timestamp": "1435735743",
  "ip": "127.0.0.1",
  "role": "ADMIN",
  "creditCards": [],
  "verified": false,
  "verifyCode": "wq9y8XnWjnbJAGPavwmXpVNq9Y2BAwWpaytJKDB6erMdQx38y7Z5kRgKzgJRQYGV",
  "containerLimit": 20,
  "deleted": false,
  "__v": 0
});
db.users.insert({
  "_id": ObjectId("559396be05974b0c00b6b282"),
  "email": "user@blackbeard.io",
  "password": "sha1$5474e86b$1$0d184fe27ec8573b8f34cf5b33e9a7a237fe5b27",
  "name": "User One",
  "username": "user01",
  "credit": 500,
  "virtualCredit": 500,
  "timestamp": "1435735744",
  "ip": "127.0.0.1",
  "role": "USER",
  "creditCards": [ObjectId("55b63553ec5d482b005cfbc6")],
  "containerLimit": 20,
  "deleted": false,
  "__v": 0
});
db.apps.insert({
  "_id": ObjectId("559396bf05974b0c00b6b284"),
  "name": "testapp",
  "user": ObjectId("559396be05974b0c00b6b282"),
  "timestamp": "1435735744",
  "containers": [ObjectId("555cb1e2fc27fe6f5f540001")],
  "image": ObjectId("555cb1e2fc27fe6f5f543901"),
  "availablePorts": ["80", "443"],
  "port": "80",
  "deleted": false,
  "__v": 0
});
db.images.insert({
  "_id": ObjectId("555cb1e2fc27fe6f5f543901"),
  "name": "exampleimage",
  "createdAt": "1432138210",
  "modifiedAt": "1432138211",
  "user": ObjectId("559396be05974b0c00b6b282"),
  "logs": [{timestamp: "1435735743"}],
  "__v": 0
});
db.images.insert({
  "_id": ObjectId("555cb1e2fc27fe6f5f543902"),
  "name": "exampleimage",
  "createdAt": "1432138210",
  "modifiedAt": "1432138211",
  "user": ObjectId("559396be05974b0c00b6b281"),
  "logs": [{timestamp: "1435735743"}],
  "__v": 0
})
db.supports.insert({
  "_id": ObjectId("555cb1e2fc27fe6f5f5439ff"),
  "name": "Contact",
  "email": "admin+contact@blackbeard.io",
  "message": "This is a test message.",
  "timestamp": "1432138210",
  "ip": "127.0.0.1",
  "__v": 0
});
db.clusters.insert({
  "_id": ObjectId("555cb1e2fc27fe6f5f540002"),
  "type": "test_swarm",
  "deleted": false,
  "machines": 2,
  "containers": [ObjectId("555cb1e2fc27fe6f5f540001")],
  "memory": 2048,
  "certificates": {
    "ca": "ca",
    "cert": "cert",
    "key": "key"
  }
})
db.containers.insert({
  "_id": ObjectId("555cb1e2fc27fe6f5f540001"),
  "region": "eu",
  "status": "UP",
  "createdAt": "1432138210",
  "deleted": false,
  "memory": 512,
  "app": ObjectId("559396bf05974b0c00b6b284"),
  "cluster": ObjectId("555cb1e2fc27fe6f5f540002"),
  "__v": 0
});
db.systems.insert({
  "_id" : ObjectId("5603f7d2fafe52010047d03f"),
  "state" : true,
  "logs" : [],
  "__v" : 1
})
