nodemon --exec " \
  docker-compose stop -t 0 $1 && \
  docker-compose start $1 && \
  docker logs --tail=10 -f \
    $(docker-compose ps | \
      awk '{print $1}' | \
      grep $1)" \
  -w $1/
