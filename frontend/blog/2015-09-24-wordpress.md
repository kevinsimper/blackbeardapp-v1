Your amazing WordPress blog needs to reach it's millions of avid readers. And it needs to reach them today :P

I am going to run you through the steps required to deploy a WordPress blog on the Blackbeard platform. You firstly need an account on Blackbeard, which can be made at:
[http://blackbeard.io/signup](http://blackbeard.io/signup).
Screenshot-2.png

Once you are signed up you will need to set a username in the interface:
Screenshot-4.png

Follow the instructions presented on the page: `docker login -u jambroo registry.blackbeard.io`.

Now let's get the wordpress image from DockerHub: `docker pull wordpress`

Once you have the image you can tag it with the blackbeard registry:
`docker tag wordpress registry.blackbeard.io/jambroo/wordpress`

And push it up to us:
`docker push registry.blackbeard.io/jambroo/wordpress`

If you don't have Google Cloud account you can sign up for one here: https://cloud.google.com/. The following video by Google is really helpful in setting up a MySQL instance: https://www.youtube.com/watch?v=_kQXgjIfLgo

Interface stuff to set env variables
* WORDPRESS_DB_HOST
* WORDPRESS_DB_USER
* WORDPRESS_DB_PASSWORD

Interface stuff to deploy

Sources:
https://hub.docker.com/_/wordpress/
https://www.youtube.com/watch?v=_kQXgjIfLgo
https://codex.wordpress.org/Editing_wp-config.php#Set_Database_Host
http://www.sitepoint.com/database-as-a-service-mysql-in-the-cloud/
