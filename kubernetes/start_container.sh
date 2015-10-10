#! /bin/bash

if [ $# -eq 0 ]; then
    echo "No argument (image name) supplied."
    exit 1
fi

echo "If you don't have $1 pull image."
sudo docker pull $1

echo "Run $1 on kubernetes cluster"
./kubernetes/cluster/kubectl.sh run $1 --image=nginx --replicas=1 --port=80

echo
source ./status.sh

