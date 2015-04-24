#!/usr/bin/python

import os

print os.popen("curl 'http://james:8000/user' -X POST -H 'Pragma: no-cache' -H 'Origin: http://james:9000' -H 'Accept-Encoding: gzip, deflate' \
  -H 'Accept-Language: en-GB,en-US;q=0.8,en;q=0.6' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux i686 (x86_64)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36' \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*' \
  -H 'Cache-Control: no-cache' \
  -H 'Referer: http://james:9000/' \
  -H 'Connection: keep-alive' \
  --data-binary '{\"email\":\"j@j.com\",\"password\":\"passw0rd\"}' \
  --compressed").read()
