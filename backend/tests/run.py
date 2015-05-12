#!/usr/bin/python

import requests
import os, urllib, json

hostname = open('./server', 'r').read().strip()

# Example usage
#apiQuery("POST", "/user", {"email": "j@jambroo.com", "password": "passw0rd"})
#apiQuery("POST", "/login", {"email": "j@jambroo.com", "password": "passw0rd"})
#apiQuery("GET", "/user", {"admin": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
#                                       "userHash": "553a2f2dbad8925a0da08c2a"})

# POST
#r = requests.post("http://james:8000/user", data=json.dumps({'email': 'js2s2322@jambroo.com', 'password': 'passw0rd'}))

# GET
#r = requests.get(hostname+"/user", data=json.dumps({'email': 'js2s2322@jambroo.com', 'password': 'passw0rd'}))

r = requests.get(hostname+"/preusers")
if r.status_code == 200:
	print "."
else:
	print "!"

# Response, status etc
#print "STATUS CODE: "+str(r.status_code)
#print "RESPONSE: "+r.text
