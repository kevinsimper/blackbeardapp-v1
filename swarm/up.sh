#!/bin/bash

SWARM_ID=$(docker run --rm swarm create)
echo $SWARM_ID

docker-machine create \
-d virtualbox \
--swarm \
--swarm-master \
--swarm-discovery token://$SWARM_ID \
swarm-master

docker-machine create \
-d virtualbox \
--swarm \
--swarm-discovery token://$SWARM_ID \
swarm-agent-00

docker-machine create \
-d virtualbox \
--swarm \
--swarm-discovery token://$SWARM_ID \
swarm-agent-01
