const path = require('path');
const Scribbler = require('./lib/scribbler');

var s = new Scribbler({ queueDir: path.join(__dirname, "..", "pigeons-server", "queue")} );

s.loadContacts()
 .then((data) => {
	 return s.applyTemplate({ contacts: data });
 })
 .catch(console.error);

