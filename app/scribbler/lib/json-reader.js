const fs = require('fs');
const readJSONFile = (filename, type='utf8') => 
  new Promise((resolve, reject) => fs.readFile(filename, type, (err, data) => {
	if(err) {
		reject(err);
	}
	else {
		try {
			let json = JSON.parse(data);
			resolve(json);
		}
		catch(e) {
			reject("MalformedJSON");
		}
	}
  }));

module.exports = { readJSONFile };
