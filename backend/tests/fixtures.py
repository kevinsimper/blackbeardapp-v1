#!/usr/bin/python

import os, urllib, json

def apiQuery(method, path, params):
    if method == "GET":
        paramsStr = urllib.urlencode(params)
        print os.popen("curl 'http://james:8000"+path+"?"+paramsStr+"' -H 'Pragma: no-cache' -H 'Origin: http://james:9000' -H 'Accept-Encoding: gzip, deflate' \
          -H 'Accept-Language: en-GB,en-US;q=0.8,en;q=0.6' \
          -H 'User-Agent: Mozilla/5.0 (X11; Linux i686 (x86_64)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36' \
          -H 'Content-Type: application/json' \
          -H 'Accept: */*' \
          -H 'Cache-Control: no-cache' \
          -H 'Referer: http://james:9000/' \
          -H 'Connection: keep-alive' \
          --compressed").read()
    else:
        print os.popen("curl 'http://james:8000"+path+"' -X "+method+" -H 'Pragma: no-cache' -H 'Origin: http://james:9000' -H 'Accept-Encoding: gzip, deflate' \
          -H 'Accept-Language: en-GB,en-US;q=0.8,en;q=0.6' \
          -H 'User-Agent: Mozilla/5.0 (X11; Linux i686 (x86_64)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36' \
          -H 'Content-Type: application/json' \
          -H 'Accept: */*' \
          -H 'Cache-Control: no-cache' \
          -H 'Referer: http://james:9000/' \
          -H 'Connection: keep-alive' \
          --data-binary '"+json.dumps(params)+"' \
          --compressed").read()


# Example usage
#apiQuery("POST", "/user", {"email": "j@jambroo.com", "password": "passw0rd"})

#apiQuery("POST", "/login", {"email": "j@jambroo.com", "password": "passw0rd"})

#apiQuery("GET", "/user", {"admin": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
#                                       "userHash": "553a2f2dbad8925a0da08c2a"})