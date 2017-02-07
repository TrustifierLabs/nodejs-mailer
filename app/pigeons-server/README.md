# pigeons-server

A simple environment to send emails through your corporate Gmail account.

Follow google instructions to set up a service account:

https://developers.google.com/identity/protocols/OAuth2ServiceAccount

## TLDR;

1. set-up a service account,
2. grant it domain-wide authority
3. a public/private key pair is downloaded to your system.

	*KEEP IT SAFE* and out of the application tree.
   	If you are using Docker put it on its own volume.
 
