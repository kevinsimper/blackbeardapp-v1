#! /bin/bash

if [ $# -eq 0 ]; then
    echo "No argument (replication conroller name) supplied."
    exit 1
fi

echo "Stopping $1 replication controller."
./kubernetes/cluster/kubectl.sh stop replicationcontroller $1

echo
source ./status.sh
