const fs = require('fs')

// return a promise. Using when we need to check if a row exist via the id
function comicsMustBeInArray(array, id) {
    console.log(id, 'comicsMustBeInArray')
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
    console.log(id, 'issueMustBeInArray')
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
            console.log(err)
        }
    })
}

module.exports = {
    // array checks
    comicsMustBeInArray,
    issueMustBeInArray,

    // adding elements
    getNewId,
    newDate,
    setImageUrl,

    notInArray,
    writeJSONFile
}