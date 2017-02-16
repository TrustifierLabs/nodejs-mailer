
const PigeAMatic = require('./lib/pigeamatic');
const $DATADIR = '/home/masud/projects/trustifier/data/afcea-members/text';

PigeAMatic.parseDirectory($DATADIR).then((list) => {
	let contacts = []
	for(e of list) {
		if(e.isSmallBusiness && e.contact.email)
			contacts.push(e.contact);
	}
	console.log(JSON.stringify({ contacts: contacts }));
}).catch((e) => console.log.bind(null, "final catch:"));
									  ;
