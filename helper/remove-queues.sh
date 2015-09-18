# You need to download the rabbitmqadmin first and put it in your path
rabbitmqadmin \
  -H blackbeard.dev -u guest -p guest -f bash list queues | \
xargs -n1 | \
xargs -I{} \
  rabbitmqadmin -H blackbeard.dev -u guest -p guest delete queue name={}
