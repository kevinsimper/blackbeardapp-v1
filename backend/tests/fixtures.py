#!/usr/bin/python

import requests
import os, urllib, json

#        print os.popen("curl 'http://james:8000"+path+"?"+paramsStr+"' -H 'Pragma: no-cache' -H 'Origin: http://james:9000' -H 'Accept-Encoding: gzip, deflate' \
#        print os.popen("curl 'http://james:8000"+path+"' -X "+method+" -H 'Pragma: no-cache' -H 'Origin: http://james:9000' -H 'Accept-Encoding: gzip, deflate' \


# Example usage
#apiQuery("POST", "/user", {"email": "j@jambroo.com", "password": "passw0rd"})

#apiQuery("POST", "/login", {"email": "j@jambroo.com", "password": "passw0rd"})

#apiQuery("GET", "/user", {"admin": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
#                                       "userHash": "553a2f2dbad8925a0da08c2a"})

# POST
r = requests.post("http://james:8000/user", data=json.dumps({'email': 'js2s2322@jambroo.com', 'password': 'passw0rd'}))



# Response, status etc
print "STATUS CODE: "+str(r.status_code)
print "RESPONSE: "+r.text