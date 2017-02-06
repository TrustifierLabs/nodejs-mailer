'use strict';

const MailTransporter = require('./lib/mail-transporter');

const mt = new MailTransporter({
	// the json file that gmail sends you, which 
	// contains the authentication tokens and the private key
	// for 2LO xoauth
	authFile: 'good-creds.json',
});

mt.sendMail({
	from: '"Ahmed Masud" <ahmed.masud@trustifier.com>', 
	to: "ahmed.masud@trustifier.com", 
	subject: "hi there you!",
	text: "well how goes it? -- don't forget to write back"
  });
