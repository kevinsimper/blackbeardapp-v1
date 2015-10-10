echo "If you don't have nginx pull image"
sudo docker pull nginx

MYNGINX=$(./kubernetes/cluster/kubectl.sh get pods | grep "mynginx" | awk '{ print $1 }')
if [ -n $MYNGINX ]
  then
    echo "Already running:"
    echo $MYNGINX
  else
    echo "Run nginx on kubernetes cluster"
    ./kubernetes/cluster/kubectl.sh run mynginx --image=nginx --replicas=1 --port=80
fi

