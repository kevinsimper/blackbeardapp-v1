docker exec -i -t $(docker ps|grep backend|head -c 12) node_modules/lab/bin/lab tests/api.js
