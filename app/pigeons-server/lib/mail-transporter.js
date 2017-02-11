'use strict';

const fs = require('fs');
const nodeMailer = require('nodemailer');
const addressParser = require('addressparser');

//
// readSecrets reads a .json for 2LO authentication, set up as a service in your google cloud
// infrastructure, download the json file from there. It has the following structure:
// { 
// 	"type": "service_account",
// 	"project_id": "foo-project",
// 	"private_key_id": "blahblah",
// 	"private_key": "-----BEGIN PRIVATE KEY-----\nBlahblah\n----END PRIVATE KEY-----\n",
//	"client_email": "happymailer@foo-bar.com",
//	"client_id": "somenumber",
//	"auth_uri": "....",
//	"token_uri": "....",
//	"auth_provider_x509_cert_url": "....",
//	"client_x509_cert_url": "....",
//
// }
const readJSONFile = (filename, type='utf8') => 
new Promise((resolve, reject) => fs.readFile(filename, type, (err, data) => {
	return err ? reject(err) : resolve(JSON.parse(data));
}));

const readSecrets = readJSONFile;

const authenticate = (authObject) => new Promise((resolve, reject) => {
	try {
		let transport = nodeMailer.createTransport({
			service: 'Gmail',
		    auth: {
			    type: 'OAuth2',
		    serviceClient: authObject.client_email,
		    privateKey: authObject.private_key,
		    }
		});
		resolve(transport);
	} catch(error) {
		reject(error);
	}

});

module.exports = class MailTransporter {


	constructor({authFile, user} = { authFile: null, user: null }) {
		if(typeof authFile == 'undefined') throw new Error("you must specify an authentication file authFile:<filename>");
		this.authFile = authFile;
		this.transport = 
			Promise.resolve(this.authFile)
			.then(readSecrets)
			.then(authenticate)
			.catch(reason => { 
				console.log("connection failed:", reason);
				throw new Error(reason);
			});
	}

	sendMail(mailOptions = {}) {
		if (typeof this.transport == 'undefined') {
			throw new Error("You need to connect to the transporter before you can send mail");
		}
		if ( typeof mailOptions.from == 'undefined' ) {
			throw new Error("Who am I sending this email as? You need to use from:");
		}

		let user = (mailOptions.auth? mailOptions.auth.user : mailOptions.user) 
			|| addressParser(mailOptions.from)[0].address || undefined;

		if ( typeof user == 'undefined' ) {
			throw new Error("Either from: has to have a valid authenticatable account, or specify auth.user:");
		}

		mailOptions.auth = { user: user };

		return this.transport.then(
			(mt) => new Promise((resolve, reject) => {
				mt.sendMail(mailOptions, (error, info) => {
					if(error) {
						reject(error);
					}
					resolve(info);
				});
			}))
			.catch((mtError) => { 
				console.log('Problem creating transport:', mtError);
				throw new Error(mtError);
			});
	}

	processMailFile(filename) {

		if(!filename) 
			throw new Error("you must provide a filename");

		return new Promise((resolve, reject) => {
			fs.access(filename, fs.constants.R_OK, (error) => {
				error ? reject(error) : resolve(filename);
			});
		})
		.then((filename) => {
			return readJSONFile(filename);
		})
		.then((options) => { 
			console.log(options);
			return this.sendMail(options);
		})
		.catch((error) => { throw new Error("processMailFile error:", error); });
	}
}
