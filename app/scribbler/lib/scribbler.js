const jr = require('./json-reader.js');
const fs = require('fs');
const path = require('path');
const Promisify = require('es6-promisify');
const HandleBars = require('handlebars');
const md5 = require('md5');
const _ = require('lodash');

const readFile = Promisify(fs.readFile);
const writeFile = Promisify(fs.writeFile);

/** Scribbler class lets you scribble emails **/
class Scribbler {

	/**
	 * Create a scribbler instance.
	 * @param {string} [contactsFile="contacts.json"] - JSON file containing contacts you want to scribble to. 
	 * @returns {Scribbler} - returns a scribbler instance
	 */
	constructor({ queueDir = null,  contactsFile = "contacts.json" } = { queueDir: null, contactsFile: "contacts.json" }) {

		if(!queueDir) throw new Error("You must the queue directory");

		this.queueDir = queueDir;

		this.contactsFile = contactsFile;

		/** 
		 * Array of contacts to scribble to
		 * @type {Array}
		 * @desc An array of contacts.
		 * 	Format of a contact is:
		 * 	{ "firstName" : "Bob", "lastName" : "Smith" , "email": "bob.smith@somewhere.com" }
		 * 	"email" key is the only one that's required.
		 * 	If the "email" key is formated as "\"Bob Smith\" <bob.smith@somewhere.com>" and
		 * 	firstName / lastName are not specified, they will be filled in through name-entity
		 * 	extraction.
		 */
		this.contacts = [];

		/**
		 * Templates that we'll use to scribble
		 * @type {Object}
		 * @desc
		 * 	Keys are "text" or "html"
		 */
		this.templates = { "text": "Hi there!", "html": "<p>Hi there!</p>"};

		/**
		 * Object of currently processed email
		 * @type {Object}
		 * @desc
		 * 	Contains
		 */

		this.currentEmail = {}

		/** 
		 * Array of currently processed emails
		 * @type {Array}
		 * @desc
		 * 	[ { email: "email@somehost.com", html: "html-merged", text: "text-merged" }... ]
		 *
		 */
		this.emails = [];

		console.log("Scribbler ready\n");
	}
	/**
	 * Load an email-list from a json file.
	 * @param {string} [contactsFile ="email-list.json"] - JSON file containing email list. 
	 * @see https://github.com/TrustifierLabs/nodejs-mailer/docs/scribbler/email-list.md
	 * @todo add the documentation file to github.
	 * @returns {Promise<Array>} - Promises a filled in contactList
	 */
	loadContacts({ contactsFile = null, filter =  null } = { contactsFile: null, filter: null } ) {
		contactsFile = contactsFile || this.contactsFile;
		return jr.readJSONFile(contactsFile).then((data) => {
			this.contacts = data;
			if(this.contacts instanceof Object) {
				this.contacts = data.contacts;
			}
			if(!(this.contacts instanceof Array)) {
				throw new Error("MalformedContacts", "contacts data must be in form of an array");
			}
			return data;
		}).catch((e) => {
			console.log("Something bad happend: ", e);
			throw e;
		});
	}
	/**
	 * process the contactList against a template
	 * @param {String} [from = "Ahmed Masud <ahmed.masud@trustifier.com>"] -- the from field
	 * @param {Array} [contactList = this.contactList] - List of contacts to merge with the template
	 * @param {String} [templatesDir = __dirname/templates] - Templates directory
	 * @param {String} [template = "default"] - This is either a file or a directory
	 * @param {String} [version = "default"] - Version of template to load (filename of template)
	 * @param {Array|String} [types = ["html", "text"]] - Types that this template supports
	 * @returns {Array} - returns this.mergedList 
	 * @todo add markdown templates
	 */
	applyTemplate(
		{ from = '"Ahmed Masud" <ahmed.masud@trustifier.com>',
			contacts = this.contacts, templatesDir = path.join(__dirname, "..", "templates"),
	       		template = "dfars-compliance-kit", version="default", types = [ "html", "text" ] } =
		{  from: '"Ahmed Masud" <ahmed.masud@trustifier.com>',
			contacts: this.contacts, templatesDir: path.join(__dirname,"..", "templates"),
			template: "dfars-compliance-kit", version: "default", types: [ "html", "text" ] })
	{
		let templateFile = path.join(templatesDir, template, version);
		if (types instanceof String) {
			types = [ types ];
		}
		if (!(types instanceof Array))  {
			throw new Error("types can only be string or an array of strings");
		}
		
		Promise.all([
			readFile(templateFile + ".html", 'utf8'),
			readFile(templateFile + ".txt", 'utf8')])
		.then(([htmlTemplate, textTemplate]) => {


			let mail = [];
			let re = new RegExp("^\s*subject:(.*)$", "gimu");

			let rv = re.exec(htmlTemplate);
			let htmlSubject = rv[1].trim();
			let index = rv.index;
			// cut out the subject line from the template
			htmlTemplate = htmlTemplate.substring(0, index-1).concat(htmlTemplate.substring(re.lastIndex+1));

			re = new RegExp("^\s*subject:(.*)$", "gimu");
			rv = re.exec(textTemplate);
			let textSubject = rv[1].trim();
			index = rv.index;
			if(index > 0) index--;
			textTemplate = textTemplate.substr(0, index).concat(textTemplate.substr(re.lastIndex+1));

			let html = { subject: htmlSubject, template: HandleBars.compile(htmlTemplate) };
			let text = { subject: textSubject, template: HandleBars.compile(textTemplate) };

			index = 0;
			let pList = [];
			for(let c of this.contacts) {
				index++;
				c.nonce = (index + Date.now()).toString(16);
				let mailFile = "email-" + c.nonce + ".json";
				c.emailHash = md5(c.email);
				let recipient = c.email;
				if(c.name) { recipient = `"${c.name}" <${c.email}>`; }
				if(c.firstName.length < 3) {
					c.salutation = "";
				}
				let envelope = {
					from: from,
					to: recipient,
					subject: textSubject,
					text: text.template(c),
					html: html.template(c)
				};
				let queueEntry = path.join(this.queueDir, mailFile);
				console.log("writing email to ", queueEntry);
				pList.push(writeFile(queueEntry, JSON.stringify(envelope)));
			}
			Promise.all(pList).then(() => {
				console.log("All emails queued up");
			});
		})
		.catch(console.err) ;
	} // end of applyTemplate
};

module.exports = Scribbler;
