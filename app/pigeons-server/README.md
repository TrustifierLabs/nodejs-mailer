# pigeons-server

A simple environment to send emails through your corporate Gmail account.

Follow google instructions to set up a service account:

https://developers.google.com/identity/protocols/OAuth2ServiceAccount

## QuickStart/TLDR;

If you have a domain account with google, *and* of course if you are the domain
administrator, you can create an app that can impersonate any user in the domain,
and use google-api to manipulate their google objects.  

In this particular case, i.e. pigeons-server, we are interested in sending
emails on behalf of users within our domain using 2LO OAuth2 authentication.

Whilst [nodemailer](https://github.com/nodemailer/nodemailer) is capabile of handling
this situation, it is not documented.

### Before you begin

**IMPORTANT**: Remeber that this only applies when you have a domain-level account with
google.

1. set-up a service account in google using your domain administrator account,
2. grant it domain-wide authority
3. a public/private key pair is downloaded to your system.

	**NOTE**: *KEEP THE PRIVATE KEY SAFE*. You won't be able to download
	it again (you can generate new ones though in case you lose the original).
	Make sure that you keep it out of the application tree.

   	If you are using Docker put it on its own volume.
 
4. 
