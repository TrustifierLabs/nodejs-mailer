const path = require('path');
const Scribbler = require('./lib/scribbler');

var s = new Scribbler({ contactsFile: "./afcea-small-business-contacts.json",
	queueDir: path.join(__dirname, "..", "pigeons-server", "generate")} );

s.loadContacts()
 .then((data) => {
	 return s.applyTemplate({ contacts: data });
 })
 .catch(console.error);

