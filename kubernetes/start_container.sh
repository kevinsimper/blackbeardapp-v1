#! /bin/bash

if [ $# -eq 0 ]; then
    echo "No argument (image name) supplied."
    exit 1
fi

echo "Run $1 on kubernetes cluster"
./kubernetes/cluster/kubectl.sh run $1 --image=nginx --replicas=1 --port=80

echo
source ./status.sh

