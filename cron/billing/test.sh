docker run --rm -v "$(pwd)":/worker -w /worker iron/images:node-0.12 sh -c 'node request -payload testpayload.json'
