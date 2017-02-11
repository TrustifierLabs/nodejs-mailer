'use strict';

const fs = require('fs');
const watchr = require('watchr');
const emailFileFilter = /\/email-[0-9a-fA-F]+\.json$/i;

module.exports = class MailQueue
{
	constructor({ queueDir = __dirname + "/var/mail/queue" } 
			= { queueDir: __dirname + "/var/mail/queue" } )
	{
		this.queueDir = queueDir;
		this.watcher = watchr.open(this.queueDir, this.process, () => {
			console.log('watcher ready for ', this.queueDir);
		});
		
	}

	start() {
		this.watcher.watch(() => {
			console.log('watching ', this.queueDir);
		});
	}

	stop() {
		this.watcher.close();
	}
	
	process(changeType, fullPath, currentStat, previousStat) {

		if(changeType != "create") 
			return; 

		if(!emailFileFilter.test(fullPath))
			return; 
		
		
	}

	log(...any) {
		console.log(any);
	}
};
