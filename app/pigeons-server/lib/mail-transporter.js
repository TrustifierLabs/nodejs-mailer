'use strict';

const fs = require('fs');

const readSecrets = (filename, type='utf8') => 
	new Promise((resolve, reject) => fs.readFile(filename, type, (err, data) => {
		return err ? reject(err) : resolve(data);
	}));


module.exports = class MailTransporter {
	constructor({authFile = "foo.json" } = { authFile: 'bar.json' }) {
		this.authFile = authFile;
		console.log("Setting up MailTransporter using: ", this.authFile);
	}

	authenticate() {
		console.log("Trying to read secrets from: ", this.authFile);
		return readSecrets(this.authFile)
				.then((resolve) => { return ("I am ready using " + this.authFile) })
				.catch((reject) => { console.log("grrr"); throw("I got really rejected: " + reject)}); 
	}
}
