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

Replace &lt;*YOURDOMAIN*&gt; in any of the instructions below with your ACTUAL domain. :-)

## The Steps to get going:

1. set-up a service account in google using your domain administrator account,

	Follow google instructions to set up a service account:
	[OAuth2ServicesAccount Instructions](https://developers.google.com/identity/protocols/OAuth2ServiceAccount)
	
2. and grant it domain-wide authority

	[See how](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#delegatingauthority)

   this option will allow you to download a JSON or a P12 (legacy/deprecated) 
   file. Please choose JSON! 
   
   Once a public/private key pair is downloaded to your system, keep that file safe.

   **ONCE AGAIN**: *KEEP THE PRIVATE KEY SAFE*. You won't be able to download
	it again, although you can generate new ones though in case you lose the original.

   **EVEN MORE IMPORTANT**: 
	Make sure that you keep your credentials file OUTSIDE of the application tree 
	that you distribute to production systems.
	Highly recommend that you distribute using some container technology, e.g. we use
	Docker.  Put the credentials in its own VOLUME 
	
 
3. add which services this new service account can actually play with at:

	https://admin.google.com/YOURDOMAIN/ManageOauthClients
 
   e.g. in our case we want to send out emails on behalf of our users, so we will add
   the gmail service as one of the APIs we can access through the service account.

   3.1 Enter the client_id from the file you got as a result of Step 2. in the **"Client Name"** field,

   	It's usually a 21 digit number e.g.: `103162732989648322554`.  
   	(*Please don't use this, I randomly typed it, don't know who it belongs to, USE YOUR OWN NUMBER.*)

   3.2 and use *https://mail.google.com/* in the "**One or More API Scopes**" field.


4. Now to pass the credentials to pigeons-mailer, you can simply do something like:

```javascript
	'use strict';

	const MailTransporter = require('./lib/mail-transporter');

	const mt = new MailTransporter({
		// the json file that gmail sends you, which 
		// contains the authentication tokens and the private key
		// for 2LO xoauth
		authFile: '/etc/security/google-api/my-service-creds.json'
	});

```

   Here `/etc/security/google-api/my-service-creds.json` is the JSON file that you got from google, and
   put OUTSIDE the app tree right? :-)


If all goes well you should be able to run the `node foo.js` where `foo.js` contains 
the script listed above and it should run like a charm and not do ANYTHING :-)

In order to actually have it work, you do need to send an email out. Append the following snippet:


```javascript
	mt.sendMail({
		from: '"Your Name" <your.name@trustifier.com>', 
		to: "someone@somewhere.com", 
		subject: "hi there you!",
		text: "well how goes it? -- don't forget to write back"
  	});

```

sendMail takes all options from [nodemailer message configuration](http://nodemailer.com/message/)

   
