#!/bin/bash
mongo db/blackbeard --eval "printjson(db.dropDatabase())"
mongo db/blackbeard < /app/fixtures.js
mongo db/blackbeard < /app/fixtures/cluster.js
