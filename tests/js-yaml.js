yaml = require('js-yaml');
fs = require('fs');
const filename = './utils/extras.yml'

function getExtras(type) {
	var type_is_null = typeof type === "undefined" || type === ''
	// Get document, or throw exception on error
	try {
		var doc = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
		if (typeof doc.extras !== "undefined") {
			var extras = doc.extras;

			// comics
			if (typeof extras.comics !== "undefined" && (type_is_null || type === 'comics')) {
				console.log('COMICS')
				_run(extras.comics)
				//iterate(extras.comics, '')

				/*
				*/
				//console.log('comics extras: ', extras.comics);
			}

			// issues
			if (typeof extras.issues !== "undefined" && (type_is_null || type === 'issues')) {
				console.log('ISSUES')
				_run(extras.issues)
				//iterate(extras.issues, '')
				//console.log('issues extras: ', extras.issues);
			}

		}
	} catch (e) {
		console.log(e);
	}
}

function _run(object) {
	Object.keys(object).forEach(function(key, i, keys) {
		var field = object[key]

		//var type = field.type
		//var default_value = field.default
		//var nullable = field.nullable
		//var example = field.example

		console.log(i, key, field);
	})
}

function iterate(obj, stack) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                iterate(obj[property], stack + '.' + property);
            } else {
                console.log(property + "   " + obj[property]);
                //$('#output').append($("<div/>").text(stack + '.' + property))
            }
        }
    }
}

getExtras('comics')