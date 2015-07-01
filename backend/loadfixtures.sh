#!/bin/bash
mongo db/blackbeard --eval "printjson(db.dropDatabase())"
mongo db/blackbeard < fixtures.js
