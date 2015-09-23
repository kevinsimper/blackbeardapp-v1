docker-machine create \
-d virtualbox \
kubernetes-master

# docker-machine ssh kubernetes-master \
#   docker run --net=host -d gcr.io/google_containers/etcd:2.0.9 /usr/local/bin/etcd --addr=127.0.0.1:4001 --bind-addr=0.0.0.0:4001 --data-dir=/var/etcd/data
#
# docker-machine ssh kubernetes-master \
#   docker run --net=host -d -v /var/run/docker.sock:/var/run/docker.sock  gcr.io/google_containers/hyperkube:v0.21.2 /hyperkube kubelet --api_servers=http://localhost:8080 --v=2 --address=0.0.0.0 --enable_server --hostname_override=127.0.0.1 --config=/etc/kubernetes/manifests
#
# docker-machine ssh kubernetes-master \
#   docker run -d --net=host --privileged gcr.io/google_containers/hyperkube:v0.21.2 /hyperkube proxy --master=http://127.0.0.1:8080 --v=2
#
# wget https://storage.googleapis.com/kubernetes-release/release/v0.18.2/bin/linux/amd64/kubectl
#
# chmod +x kubectl
#
# ./kubectl run nginx --image=nginx --port=80
