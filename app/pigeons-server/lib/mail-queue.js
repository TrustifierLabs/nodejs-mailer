'use strict';

const fs = require('fs');

module.exports = class MailQueue {
	constructor({ queueDir = __dirname + "/var/mail/queue" } = { queueDir: __dirname + "/var/mail/queue" } ) {
		console.log(queueDir);
		fs.watch(queueDir, (eventType, filename) => {
			console.log(eventType, filename);
		});
	}
};
