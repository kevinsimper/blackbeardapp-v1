#! /bin/bash

echo "Please note if this hangs you will need to run up.sh manually." 
echo "Press ENTER to continue."
read

# Will git clone into a new folder called ./kubernetes
export KUBERNETES_PROVIDER=vagrant
curl -sS https://get.k8s.io | bash
