use blackbeard;
db.apps.insert({ "_id" : ObjectId("559396bf05974b0c00b6b284"), "name" : "Test App", "user" : ObjectId("559396be05974b0c00b6b281"), "timestamp" : "1435735744", "__v" : 0 });
db.preusers.insert({ "_id" : ObjectId("559396bf05974b0c00b6b283"), "email" : "admin+signup@blackbeard.io", "active" : false, "timestamp" : "1435735743", "ip" : "127.0.0.1", "__v" : 0 });
db.users.insert({ "_id" : ObjectId("559396be05974b0c00b6b281"), "email" : "admin+users@blackbeard.io", "password" : "sha1$eafa69f9$1$9f1dec8706fe0368266c867f636213513eebfe14", "credit" : 10, "timestamp" : "1435735743", "ip" : "127.0.0.1", "__v" : 0 });
db.supports.insert({ "_id" : ObjectId("555cb1e2fc27fe6f5f5439ff"), "name" : "Contact", "email" : "admin+contact@blackbeard.io", "message" : "This is a test message.", "timestamp" : "1432138210", "ip" : "127.0.0.1", "__v" : 0 });
