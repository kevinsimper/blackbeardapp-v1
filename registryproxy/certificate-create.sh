#!/bin/bash
openssl req \
    -new \
    -newkey rsa:4096 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/C=DK/ST=Denial/L=Copenhagen/O=Dis/CN=registry.blackbeard.dev" \
    -keyout registry.blackbeard.dev.key \
    -out registry.blackbeard.dev.crt
