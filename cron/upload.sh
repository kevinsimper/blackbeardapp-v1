zip -r billing.zip billing/
iron worker upload --zip billing.zip -name cron-billing iron/images:node-0.12 sh -c 'node request -payload testpayload.json'
