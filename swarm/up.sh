#!/bin/bash
docker-machine create -d virtualbox local
eval "$(docker-machine env local)"
SWARM_ID=$(docker run swarm create)

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

eval $(docker-machine env --swarm swarm-master)
docker info
