nodemon --exec "docker-compose stop -t 0 $1 && docker-compose start $1 && docker-compose logs $1" -w $2/
