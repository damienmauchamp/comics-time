yaml = require('js-yaml');
fs = require('fs');
const filename = './utils/extras.yml'
 
// Get document, or throw exception on error
try {
	var doc = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
	if (typeof doc.extras !== "undefined") {
		var extras = doc.extras;

		// comics
		if (typeof extras.comics !== "undefined") {
			Object.keys(extras.comics).forEach(function(key, i, keys) {
				var field = extras.comics[key]

				/*var type = field.type
				var default_value = field.default
				var nullable = field.nullable
				var example = field.example*/

				//console.log(i, key, field, default_value);
			})
			console.log('comics extras: ', extras.comics);
		}

		// issues
		if (typeof extras.issues !== "undefined") {
			console.log('issues extras: ', extras.issues);
		}

	}
} catch (e) {
	console.log(e);
}