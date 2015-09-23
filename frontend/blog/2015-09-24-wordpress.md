Your amazing WordPress blog needs to reach it's millions of avid readers. And it needs to reach them today :P

docker login registry.blackbeard.io

I am going to run you through the steps required to deploy a WordPress blog on the Blackbeard platform. The wordpress container is easily obtained by running the following command `docker pull wordpress`


Once you have the image you can tag it with the blackbeard registry:
`docker tag wordpress registry.blackbeard.io/jambroo/wordpress`

docker push registry.blackbeard.io/jambroo/wordpress

Google Cloud mysql instance steps

Interface stuff to set env variables

Interface stuff to deploy

Sources:
https://hub.docker.com/_/wordpress/
