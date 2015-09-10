docker run --rm -v "$(pwd)":/worker -v "$(pwd)"/../testpayload.json:/testpayload.json -w /worker iron/images:node-0.12 sh -c 'node request -payload /testpayload.json'
