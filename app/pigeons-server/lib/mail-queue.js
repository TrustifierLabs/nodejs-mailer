'use strict';

const fs = require('fs');
const watchr = require('watchr');
const MailTransporter = require('./mail-transporter');

const emailFileFilter = /\/email-[0-9a-fA-F]+\.json$/i;
const winston = require('winston');


const mkdir = (path) => 
	new Promise((resolve, reject) => {
		fs.stat(path, (error, stats) => {
			if (error && error.code == 'ENOENT') {
				fs.mkdir(path, (err) => { 
					return err ? reject(err) : resolve(path);
				});
			}
			else if(!error && stats.isDirectory()) { resolve(path); }
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
		rejectedDir = __dirname + "/var/mail/rejected",
		maxListeners = 50,
		authFile = "/etc/security/google-api/service-creds.json"
       	} = { 	queueDir: __dirname + "/var/mail/queue",
		sentDir:  __dirname + "/var/mail/sent",
		rejectedDir: __dirname + "/var/mail/rejected",
		maxListeners: 50,
		authFile: "/etc/security/google-api/service-creds.json"
       	})
	{
		this.queueDir = queueDir;
		this.sentDir = sentDir;
		this.rejectedDir = rejectedDir;
		this.logger = new (winston.Logger);
		this.logger.add(winston.transports.File, 
			{ filename: 'logs/mail-queue.log', handleExceptions: true, humanReadableUnhandledException: true });
		this.logger.add(winston.transports.Console, 
			{ handleExceptions: true, humanReadableUnhandledException: true });
		this.log("Logging Ready\n");

		this.transporter = new MailTransporter({ authFile: authFile, logger: this });
		mkdir(this.rejectedDir).catch((e) => { console.error("unable to create/access ", this.rejectedDir, ":", e); });
		this.stalker =
			mkdir(this.queueDir)
			.then((path) => {
				var s = new watchr.Stalker(path);
				s.setMaxListeners(maxListeners);
				s.on('change', this.process.bind(this));
				return s;
			})
			.catch((e) => this.error("problems getting a stalker:", e));
	}

	start() {
		return this.stalker.then((s) => {
			return s.watch((err) => { 
				if(err) {
					throw new Error(err);
				}
			});
		}).catch((e) => { this.error("problems starting the watcher", e); throw new Error(e); });
	}

	stop() {
		this.stalker.close();
	}

	process(changeType, fullPath, currentStat, previousStat) {

		if(changeType != "create")
			return; 

		if(!emailFileFilter.test(fullPath))
			return; 
		
		let basename = fullPath.substr(fullPath.lastIndexOf('/')+1);
		return this.transporter.processMailFile(fullPath).then((result) => {
			this.log("mail processing result", result);
			fs.rename(fullPath, this.sentDir + '/' + basename, (err) => {
				if (err) throw new Error(err);
			});
		}).catch((error)=> { 
			if(error == "MalformedEmail") {
				fs.rename(fullPath, this.rejectedDir + '/' + basename, (err) => {
					if (err) throw new Error(err);
					this.error(`malformed email: moving ${fullPath} to ${this.rejectedDir}`);
				});
			}
			else {
				throw error;
			}
		});
	}

	log(...any) {
		this.logger.info.call(this, any);
	}

	error(...any) {
		this.logger.error.call(this, any);
	}
};
