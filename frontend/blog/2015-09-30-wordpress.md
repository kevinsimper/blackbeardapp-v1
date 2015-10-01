Your amazing WordPress blog needs to reach it's millions of avid readers. And it needs to reach them today :P

I am going to run you through the steps required to deploy a WordPress blog on the Blackbeard platform. You firstly need an account on Blackbeard, which can be made at:
[http://blackbeard.io/signup](http://blackbeard.io/signup).
![Sign up page](/images/blog/blackbeard_signup.png)

Once you are signed up you will need to set a username in the interface:
![Username field](/images/blog/blackbeard_setusername.png)

Follow the instructions presented on the page: `docker login -u username registry.blackbeard.io`.

Now let's get the wordpress image from DockerHub: `docker pull wordpress`

Once you have the image you can tag it with the blackbeard registry:
`docker tag wordpress registry.blackbeard.io/username/wordpress`

And push it up to us:
`docker push registry.blackbeard.io/username/wordpress`

If you don't have Google Cloud account you can sign up for one here: https://cloud.google.com/. They offer a free trial on their Cloud platform if you haven't previously signed up. There is extensive documentation on setting up and using this service at https://cloud.google.com/sql/docs/getting-started, which features a [youtube video](https://youtu.be/_kQXgjIfLgo) on creating an instance.

Because the actual IP of our container will not be known we can set the allowed networks of our MySql server to "0.0.0.0/0". This can be found under the "Access Control" tab in the "Authorization" sub-tab of the Cloud SQL instance page. You will need to create a user for WordPress to log into the database as too, which is done from the "Users" sub-tab.

Create a new App on Blackbeard.



Interface stuff to set env variables. In my case because I am hugely security-conscious I set them to:

Interface stuff to deploy

And voilà WordPress is running online: ![It's alive!](/images/blog/wordpress-running.png)

Sources:
https://hub.docker.com/_/wordpress/
https://www.youtube.com/watch?v=_kQXgjIfLgo
https://codex.wordpress.org/Editing_wp-config.php#Set_Database_Host
http://www.sitepoint.com/database-as-a-service-mysql-in-the-cloud/
