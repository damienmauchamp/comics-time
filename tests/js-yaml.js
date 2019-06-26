yaml = require('js-yaml');
fs = require('fs');
const filename = './utils/extras.yml'

var test_extras = {
	// AVAILABLE
	// available, type = object
	/*links: {
		link1: "///",
		link2: "xxxx",
	},*/
	// available, type = number
	//marvel: 24229,

	// available, type error
	//links: "error ?",
	/*marvel: {
		link1: "///",
		link2: "xxxx",
	},*/

	// available, null, nullable
	marvel: null,

	// available, null, !nullable
	links: null,

	// UNAVAILABLE
	// unavailable, type = object
	un_object: {
		link1: "///",
		link2: "xxxx",
	},
	// unavailable, type = int
	un_int: 24229,
}

function getExtras(type, test_extras) {
	var type_is_null = typeof type === "undefined" || type === ''
	// Get document, or throw exception on error
	try {
		var doc = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
		if (typeof doc.extras !== "undefined") {
			var extras = doc.extras;

			// comics
			if (typeof extras.comics !== "undefined" && type === 'comics') {
				console.log('COMICS')
				comics_extras = _setExtras(extras.comics, test_extras)
				console.log('extras:', comics_extras)
				//iterate(extras.comics, '')

				/*
				*/
				//console.log('comics extras: ', extras.comics);
			}

			// issues
			if (typeof extras.issues !== "undefined" && type === 'issues') {
				console.log('ISSUES')
				issues_extra = _setExtras(extras.issues, test_extras)
				console.log('extras:', comics_extras)
				//iterate(extras.issues, '')
				//console.log('issues extras: ', extras.issues);
			}

		}
	} catch (e) {
		console.log(e);
	}
}

function _setExtras(extras, values) {
	var results = {}
	console.log(values)
	Object.keys(extras).forEach(function(key, i, keys) {
		var field = extras[key]

		if (typeof values[key] !== 'undefined') {
			var add_field = true;

			// checking nullable (if null --> default)
			if ((!field.nullable || typeof field.nullable === "undefined") && (!values[key] || values[key] === null)) {
				if (typeof field.default !== "undefined") {
					values[key] = field.default
				} else {
					add_field = false
				}
				console.log("null value for '" + key + "'" + (values[key] ? ", setting default: " : ""), values[key])
			}

			// checking type, else throw error with example
			switch (field.type) {
				case 'int':
				case 'integer':
				case 'number':
				case 'float':
					if ((['int', 'integer', 'number', 'float']).includes(typeof values[key]) || (field.nullable && values[key] === null)) {
						// ok
					} else {
						// not ok
						console.warn("warning: '" + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
						
						var default_value = setDefault(key, values[key], field.nullable, field.default)
						if (default_value === values[key]) {
							add_field = false
						} else {
							values[key] = default_value
						}
					}
					break

				case 'string':
				case 'text':
					if (typeof values[key] === 'string') {
						// ok
					} else {
						// not ok
						console.warn("warning: " + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
						
						var default_value = setDefault(key, values[key], field.nullable, field.default)
						if (default_value === values[key]) {
							add_field = false
						} else {
							values[key] = default_value
						}
					}
					break

				case 'array':
				case 'object':
					if (typeof values[key] === 'object') {
						// ok
					} else {
						// not ok
						console.warn("warning: " + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
						
						var default_value = setDefault(key, values[key], field.nullable, field.default)
						if (default_value === values[key]) {
							add_field = false
						} else {
							values[key] = default_value
						}
					}
					break

				default:
					// not ok
					console.warn("warning: " + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
						
					var default_value = setDefault(key, values[key], field.nullable, field.default)
					if (default_value === values[key]) {
						add_field = false
					} else {
						values[key] = default_value
					}
					break


			}

			if (add_field) {
				results[key] = values[key]
				console.log('ADDED -->', key, results[key])
			} else {
				console.error('ERROR -->', key, values[key])
			}
		}
		// default extras
		else {
			if (!field.nullable || typeof field.nullable === "undefined") {
				if (typeof field.default !== "undefined") {
					results[key] = field.default
					console.log('ADDED -->', key, results[key])
				} else {
					console.error("ERROR -->', 'there is no default value for non-nullable '" + key + "' field in your extra file")	
				}
			}
		}


		//var type = field.type
		//var default_value = field.default
		//var nullable = field.nullable
		//var example = field.example

		//console.log(i, key, field);
	})
	return results;
}

function setDefault(key, value, nullable, def) {
	if (!nullable && def) {
		console.warn("-- setting default value " + (typeof def !== 'object' ? "'" + def + "' " : "") + "for '" + key + "'")
		return def
	}
	return value;
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

getExtras('comics', test_extras)