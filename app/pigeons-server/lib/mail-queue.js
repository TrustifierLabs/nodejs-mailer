'use strict;'


module.exports = class MailQueue {
	constructor({ queueDir } = { queueDir: __dirname + "/var/mail/queue" } ) {
		console.log(queueDir);
	}
};
