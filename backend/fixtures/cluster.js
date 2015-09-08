// This should come directly from mongo
use blackbeard;
db.clusters.insert({
  "_id": ObjectId("55d9a1d59fa1480f006f8bbc"),
  "deleted": false,
  "type": "swarm",
  "machines": 3,
  "ip": "---CLUSTER-IP---",
  "certificates": {
    "ca": "---CA---",
    "cert": "---CERT---",
    "key": "---KEY---",
    "sshPublic": "---KEY---",
    "sshPrivate": "---KEY---",
    "sshUser": "---KEY---"
  },
  "__v": 0
})
