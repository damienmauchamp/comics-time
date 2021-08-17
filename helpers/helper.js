const fs = require('fs')
const yaml = require('js-yaml')
const extras_file = require('../data/extras_example.yml')

// return a promise. Using when we need to check if a row exist via the id
function comicsMustBeInArray(array, id) {
    //console.log(id, 'comicsMustBeInArray')
    return new Promise((resolve, reject) => {
        const row = array.find(r => r.id == id)
        //const row = array.find(r => r._id == id)
        if (!row) {
            reject({
                message: 'Comics ID can\'t be found',
                status: 404
            })
        }
        resolve(row)
    })
}

function issueMustBeInArray(array, id) {
    //console.log(id, 'issueMustBeInArray')
    return new Promise((resolve, reject) => {
        const row = array.find(r => r.id == id)
        //const row = array.find(r => r._id == id)
        if (!row) {
            reject({
                message: 'Issue ID can\'t be found',
                status: 404
            })
        }
        resolve(row)
    })
}



// searching in the array the last id and increment of 1 to return a new id
const getNewId = (array) => {
    if (array.length > 0) {
        //return array[array.length - 1].id + 1
        return array[array.length - 1]._id + 1
    } else {
        return 1
    }
}

// return the date of your server in ISO 8601
const newDate = () => new Date().toString()

const setImageUrl = (src) => src.replace('original', '{{code}}')


function notInArray(array, id) {
    return new Promise((resolve, reject) => {
        const row = array.find(r => r.id == id)
        //const row = array.find(r => r._id == id)
        if (row) {
            reject({
                message: 'ID is not good',
                status: 404
            })
        }
        resolve(row)
    })
    //return !array.find(r => r.id == id)
}

// write new array in the JSON File data
function writeJSONFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (err) => {
        if (err) {
            //console.log(err)
        }
    })
}

// type: type
// array: new values
// existing_extras: already existing values
function getExtras(type, array, existing_extras) {
    if (typeof array === "undefined") {
        array = {}
    }
    if (typeof existing_extras === "undefined") {
        existing_extras = {}
    }
    //console.log("existing_extras", existing_extras)
    // Get document, or throw exception on error
    try {
        var doc = {};//yaml.safeLoad(fs.readFileSync(extras_file, 'utf8'));
        if (typeof doc.extras !== "undefined") {
            var extras = doc.extras;

            // comics
            if (typeof extras.comics !== "undefined" && type === 'comics') {
                //console.log('COMICS')
                comics_extras = setExtras(extras.comics, array)
                //console.log('--- existing:', existing_extras)
                //console.log('--- extras before:', comics_extras)
                if (Object.keys(existing_extras).length) {
                    comics_extras = mergeExtras(existing_extras, comics_extras)
                    //comics_extras = {...existing_extras, ...comics_extras};
                    //Object.assign(existing_extras, comics_extras)   
                }
                //console.log('--- extras:', comics_extras)
                return comics_extras;
                //iterate(extras.comics, '')

                /*
                */
                //console.log('comics extras: ', extras.comics);
            }

            // issues
            if (typeof extras.issues !== "undefined" && type === 'issues') {
                //console.log('ISSUES')
                issues_extras = setExtras(extras.issues, array)
                //console.log('extras before:', issues_extras)
                if (Object.keys(existing_extras).length) {
                    issues_extras = mergeExtras(existing_extras, issues_extras)
                    //issues_extras = {...existing_extras, ...issues_extras};
                    //Object.assign(existing_extras, issues_extras)
                }
                //console.log('extras:', issues_extras)
                return issues_extras;
                //iterate(extras.issues, '')
                //console.log('issues extras: ', extras.issues);
            }
            /*
            const extras = 
            Object.assign(newComic, extras)
            console.log(newComic, extras)
            */

        }
        return {}
    } catch (e) {
        console.error(e);
    }
}

function setExtras(extras, values) {
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
                //console.log("null value for '" + key + "'" + (values[key] ? ", setting default: " : ""), values[key])
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
                        //console.warn("warning: '" + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
                        
                        var default_value = setExtraDefault(key, values[key], field.nullable, field.default)
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
                        //console.warn("warning: " + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
                        
                        var default_value = setExtraDefault(key, values[key], field.nullable, field.default)
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
                        //console.warn("warning: " + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
                        
                        var default_value = setExtraDefault(key, values[key], field.nullable, field.default)
                        if (default_value === values[key]) {
                            add_field = false
                        } else {
                            values[key] = default_value
                        }
                    }
                    break

                default:
                    // not ok
                    //console.warn("warning: " + key + "'", "expected '" + field.type + "', got '" + (values[key] !== null ? typeof values[key] : null) + "'")
                        
                    var default_value = setExtraDefault(key, values[key], field.nullable, field.default)
                    if (default_value === values[key]) {
                        add_field = false
                    } else {
                        values[key] = default_value
                    }
                    break


            }

            if (add_field) {
                results[key] = values[key]
                //console.log('ADDED -->', key, results[key])
            } else {
                //console.error('ERROR -->', key, values[key])
            }
        }
        // default extras
        else {
            if (!field.nullable || typeof field.nullable === "undefined") {
                if (typeof field.default !== "undefined") {
                    results[key] = field.default
                    //console.log('ADDED -->', key, results[key])
                } else {
                    //console.error("ERROR -->', 'there is no default value for non-nullable '" + key + "' field in your extra file") 
                }
            }
        }
    })
    return results;
}

function setExtraDefault(key, value, nullable, def) {
    if (!nullable && def) {
        console.warn("-- setting default value " + (typeof def !== 'object' ? "'" + def + "' " : "") + "for '" + key + "'")
        return def
    }
    return value;
}

function mergeExtras(obj1, obj2) {
    var final = {};
    Object.values({...Object.keys(obj1), ...Object.keys(obj2)}).forEach(function(value, i) {
        var item = null;
        if (typeof obj2[value] !== "undefined") {
            item = obj2[value];
            //console.log(2, value, item);
        }
        if (typeof item === "undefined" || item === null) {
            item = obj1[value];
            //console.log(1, value, item);
        }
        if (typeof item === "object") {
            item = {...obj1[value], ...item};
        }
        final[value] = item;
    });
    return final;
}

//
/**
 * Find the first unread issue
 * 
 * @param { read: boolean; } data 
 * @returns 
 */
const findFirstNotRead = (data) => data.find(i => !i.read) || false;

/**
 * Find the first unread issue's index
 * 
 * @param { read: boolean; } data 
 * @returns 
 */
const findFirstNotReadIndex = (data) => data.findIndex(i => !i.read) || false;

/**
 * Find the next unread issue
 * 
 * @param { read: boolean; } data 
 * @returns 
 */
const findNextToRead = (data, returnIndex) => {
    let maxReadTimestamp = Math.max.apply(null, data.filter(issue => issue.read).map(issue => new Date(issue.read).getTime())),
        lastReadIndex = data.map(issue => new Date(issue.read).getTime()).indexOf(maxReadTimestamp),
    // let lastReadIndex = data.map(issue => issue.read && issue.read !== false).lastIndexOf(true),
        nextToReadIndex = lastReadIndex + 1;
    // return (returnIndex|| false) ? (data[nextToReadIndex] !== undefined ? nextToReadIndex : false ) : data[nextToReadIndex] || false;
    return (returnIndex || false) ? (data[nextToReadIndex] !== undefined ? nextToReadIndex : findFirstNotReadIndex(data) ) : data[nextToReadIndex] || findFirstNotRead(data);
};

module.exports = {
    // array checks
    comicsMustBeInArray,
    issueMustBeInArray,

    // adding elements
    getNewId,
    newDate,
    setImageUrl,

    // extras
    getExtras,
    setExtras,
    setExtraDefault,
    mergeExtras,

    notInArray,
    writeJSONFile,

    //
    findNextToRead,
}