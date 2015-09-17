#!/bin/bash

SWARM_ID=$(docker run --rm swarm create)
echo $SWARM_ID

docker-machine create \
-d virtualbox \
--swarm \
--swarm-master \
--swarm-discovery token://$SWARM_ID \
--engine-insecure-registry registry.blackbeard.dev:9500 \
swarm-master

#docker-machine upgrade swarm-master
