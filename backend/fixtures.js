use blackbeard;
db.apps.insert({
  "_id": ObjectId("559396bf05974b0c00b6b284"),
  "name": "Test App",
  "cname": "testapp",
  "user": ObjectId("559396be05974b0c00b6b281"),
  "timestamp": "1435735744",
  "deleted": false,
  "__v": 0
});
db.preusers.insert({
  "_id": ObjectId("559396bf05974b0c00b6b283"),
  "email": "admin+signup@blackbeard.io",
  "active": false,
  "timestamp": "1435735743",
  "ip": "127.0.0.1",
  "__v": 0
});
db.users.insert({
  "_id": ObjectId("559396be05974b0c00b6b281"),
  "email": "admin+users@blackbeard.io",
  "password": "sha1$5474e86b$1$0d184fe27ec8573b8f34cf5b33e9a7a237fe5b27",
  "name": "Blackbeard",
  "credit": 1000,
  "timestamp": "1435735743",
  "ip": "127.0.0.1",
  "role": "ADMIN",
  "creditCards": [{ _id: '55b1f17b7b4ad02b00939a81',
    name: 'Test Creditcard',
    number: '1234',
    brand: 'visa',
    token: '12345678'
  }],
  "deleted": false,
  "__v": 0
});
db.supports.insert({
  "_id": ObjectId("555cb1e2fc27fe6f5f5439ff"),
  "name": "Contact",
  "email": "admin+contact@blackbeard.io",
  "message": "This is a test message.",
  "timestamp": "1432138210",
  "ip": "127.0.0.1",
  "__v": 0
});
