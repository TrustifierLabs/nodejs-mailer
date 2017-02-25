const fs = require('fs');
const path = require('path');

const Promise = require('bluebird');
const Promisify = Promise.promisify;

const readFile = Promisify(fs.readFile);
const readDir  = Promisify(fs.readdir);

const emailRe = new RegExp('(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))', 'gi');

class PigeAMatic {
	constructor({ datadir } = { datadir: null }) {
		if(!datadir) 
			throw new Error("ENOENT", "Need a datadirectory");
		this.datadir = datadir;
	}

	static parseData(data) {
		var record = {
			businessClass: "",
			name: "",
		};
		let lines = data.split(/\n/);
		let m = false;
		lines = lines.filter((line) => { return !(/^\[?\s*\]?$/.test(line)); });
		record.businessClass = (() => {
			let rv = [];
			let entries = lines.slice(0, 3).entries();
			for(let e of entries) { 
				if((m = /^\[([^\]]+)\]/.exec(e[1])) != null) {
					lines.splice(e[0], 1);
					rv.push(m[1]);
				}
			}
			return rv.join(",");
		})();
		record.memberSince = (() => {
			let re = /Member\s+Since:\s*([0-9]+)/gi;
			let entries= lines.slice(0, 3).entries();
			for(let e of entries) { 
				if((m = re.exec(e[1])) !== null) {
					lines.splice(e[0], 1);
					return m[1];
				}
			}
		})();
		record.contact = {};
		record.contact.company = { fullName : lines.splice(0,1)[0] };
		Object.assign(record.contact, (() => {
			let entries = lines.slice(0, 30).entries();
			for(let e of entries) {
				let m = /EMAIL:?\s*([^\s]+)/i.exec(e[1]);
				if(m) {
					lines.splice(e[0], 1);
					return { email: m[1],
					hasGenericEmail: /(learn[^@]*|info|contact(us)?|support|sales|pr)@/i.test(m[1]) };
				}
			}
			return { email: null, hasGenericEmail: null };
		})());

		record.contact.telephone = (() => {
			let entries = lines.slice(0, 30).entries();
			for(let e of entries) {
				let m = /TELEPHONE:?\s*([a-z\*\#\s0-9\-\.]+)/i.exec(e[1]);
				if(m) {
					lines.splice(e[0], 1);
					return m[1];
				}
			}
			return null;
		})();
		Object.assign(record.contact, (() => {
			let titleIndex = lines.slice(0, 15).findIndex((element) => {
				return /(MANAGER|DIRECTOR|CEO|CHIEF|PRESIDENT|EXECUTIVE|VP):/ig.test(element);
			});
			if(titleIndex >= 0) {
				let title = lines.splice(titleIndex, 1)[0];
				title = title.trim().replace(/:/, "");
				let name = lines.splice(titleIndex, 1)[0].trim();
				return { name: name, title: title };
			}
			else {
				return ({ name: null, title: null });
			}
		})());
		Object.assign(record, (() => {
			let statusIndex = lines.findIndex((element) => {
				return /SMALL\s+BUSINESS\s+STATUS:/i.test(element);
			});
			if(statusIndex >= 0) {
				let smbStatus = lines[statusIndex+1];
				let m =/-\s*(not)?\s*(small\s*business)/i.exec(smbStatus);
				smbStatus = m && (m[1] != undefined );
				return { isSmallBusiness: smbStatus };
			}
			else {
				return { isSmallBusiness: false };
			}
		})());
		if(!record.contact.name && record.contact.email && !record.contact.hasGenericEmail) {
			((c) => {
				let m = /([^@\.]+)(\.?([^@]+))?@(.+)/i.exec(c.email);
				if(m && m[3]) {
					record.contact.name = 
						[m[1], m[3]].map((e) => {
							let x = e.toLowerCase().split("");
							x[0] = x[0].toUpperCase();
							return x.join("");
						}).join(" ");
					record.contact.hasGeneratedName = true;
				}
			})(record.contact);
		}
		return record;
	}

	static parse(path) {
		this.data = readFile(path, 'utf8');
		return this.data.then(this.parseData);
	}

	static parseDirectory(datadir) {
		return readDir(datadir)
			.then((list) => {
				var plist = [];
				list.forEach((f) => plist.push(PigeAMatic.parse(path.join(datadir, f))));
				return Promise.all(plist);
			})
		.catch((e) => { console.log(e); throw e; });
	}
}

module.exports = PigeAMatic;
