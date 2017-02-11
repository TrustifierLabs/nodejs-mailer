'use strict';

const MailTransporter = require('./lib/mail-transporter');

// the json file that gmail sends you, which 
// contains the authentication tokens and the private key
// for 2LO xoauth
const mt = new MailTransporter({
	authFile: '/etc/security/google-api/service-creds.json',
});


mt.processMailFile("./queue/email-0000001.json");
