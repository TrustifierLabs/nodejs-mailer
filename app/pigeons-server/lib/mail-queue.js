'use strict';

const fs = require('fs');
const watchr = require('watchr');
const MailTransporter = require('./mail-transporter');

const emailFileFilter = /\/email-[0-9a-fA-F]+\.json$/i;


const mkdir = (path) => 
	new Promise((resolve, reject) => {
		fs.stat(path, (error, stats) => {
			if (error && error.code == 'EEXIST') {
				fs.mkdir(path, (err) => { 
					return err ? reject(err) : resolve(path);
				});
			}
			else if(!error && stats.isDirectory()) { console.log("resolved path:", path); resolve(path); }
		       	else {
				reject(error);
			}
		});
	});

module.exports = class MailQueue
{
	constructor({ 
		queueDir = __dirname + "/var/mail/queue", 
		sentDir = __dirname + "/var/mail/sent",
		authFile = "/etc/security/google-api/service-creds.json"
       	} = { 	queueDir: __dirname + "/var/mail/queue",
		sentDir:  __dirname + "/var/mail/sent",
		authFile: "/etc/security/google-api/service-creds.json"
       	})
	{
		this.queueDir = queueDir;
		this.sentDir = sentDir;
		this.transporter = new MailTransporter({ authFile: authFile });
		this.stalker = mkdir(this.queueDir)
			.then((path) => {
				var w = watchr.open(path, this.process.bind(this), (err) => {
					if(err) throw new Error(err);
				});
				return w;
			})
			.then((w) => w)
			.catch((e) => this.log("problems getting a stalker:", e));
	}

	start() {
		return this.stalker.then((s) => {
			return s.watch((err) => { 
				if(err) {
					throw new Error(err);
				}
			});
		}).catch((e) => { this.log("problems starting the watcher", e); });
	}

	stop() {
		this.stalker.close();
	}

	process(changeType, fullPath, currentStat, previousStat) {

		if(changeType != "create")
			return; 

		if(!emailFileFilter.test(fullPath))
			return; 
		
		return this.transporter.processMailFile(fullPath).then((result) => {
			console.log("mail processing result", result);
			let basename = fullPath.substr(fullPath.lastIndexOf('/')+1);
			fs.rename(fullPath, this.sentDir + '/' + basename, (err) => {
				if (err) throw new Error(err);
			});
		}).catch((error)=> { throw new Error(error) });
	}

	log(...any) {
		console.log.call(this, "logging:", any);
	}
};
