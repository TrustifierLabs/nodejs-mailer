# pigeons-server

A simple environment to send emails through your corporate Gmail account.

If you have a domain account with google, *and* of course if you are the domain
administrator, you can create an app that can impersonate any user in the domain,
and use google-api to manipulate their google objects.  

In this particular case, i.e. pigeons-server, we are interested in sending
emails on behalf of users within our domain using 2LO OAuth2 authentication.

Whilst [nodemailer](https://github.com/nodemailer/nodemailer) is capabile of handling
this situation, it is not documented.

## Before you begin

**IMPORTANT**: Remeber that this only applies when you have a domain-level account with
google.

## The Steps to get going:

1. set-up a service account in google using your domain administrator account,

	Follow google instructions to set up a service account:
	[OAuth2ServicesAccount Instructions](https://developers.google.com/identity/protocols/OAuth2ServiceAccount)
	
2. and grant it domain-wide authority

	[See how](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#delegatingauthority)

	a public/private key pair is downloaded to your system.

	**NOTE**: *KEEP THE PRIVATE KEY SAFE*. You won't be able to download
	it again (you can generate new ones though in case you lose the original).
	Make sure that you keep it out of the application tree.

   	If you are using Docker of pigeons-server, put the key in its own volume.
 
3.  
