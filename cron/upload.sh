pushd billing
zip -r data.zip .
popd
iron worker upload --zip billing/data.zip --name cron-billing5 iron/images:node-0.12 node request
