'use strict';

const MailTransporter = require('./lib/mail-transporter');

const mt = new MailTransporter({
	// the json file that gmail sends you, which 
	// contains the authentication tokens and the private key
	// for 2LO xoauth
	authFile: 'foo.json'
});

mt.authenticate()
	.then((resolve) => console.log("I am authenticated: ", resolve))
	.catch((reject) => console.log("I got rejected: ", reject));
