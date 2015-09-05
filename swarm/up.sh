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

sleep 3
docker-machine ssh swarm-master "sudo sh -c \" echo ----LOCAL_IP---- registry.blackbeard.dev >> /etc/hosts\""

docker-machine create \
-d virtualbox \
--swarm \
--swarm-discovery token://$SWARM_ID \
--engine-insecure-registry registry.blackbeard.dev:9500 \
swarm-agent-00

sleep 3
docker-machine ssh swarm-agent-00 "sudo sh -c \" echo ----LOCAL_IP---- registry.blackbeard.dev >> /etc/hosts\""

docker-machine create \
-d virtualbox \
--swarm \
--swarm-discovery token://$SWARM_ID \
--engine-insecure-registry registry.blackbeard.dev:9500 \
swarm-agent-01

sleep 3
docker-machine ssh swarm-agent-01 "sudo sh -c \" echo ----LOCAL_IP---- registry.blackbeard.dev >> /etc/hosts\""
