# Will git clone into a new folder called ./kubernetes
curl -sS https://get.k8s.io | bash

# then
# cd kubernetes
# ./kubernetes/cluster/kubectl.sh get pods

# ./kubernetes/cluster/kubectl.sh run nginx --image=nginx --port=80
