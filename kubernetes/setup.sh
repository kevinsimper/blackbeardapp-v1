#! /bin/bash

# Will git clone into a new folder called ./kubernetes
export KUBERNETES_PROVIDER=vagrant
curl -sS https://get.k8s.io | bash

./kubernetes/cluster/kubectl.sh get pods
