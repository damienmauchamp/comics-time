const fs = require('fs')

// searching in the array the last id and increment of 1 to return a new id
const getNewId = (array) => {
    if (array.length > 0) {
        return array[array.length - 1]._id + 1
    } else {
        return 1
    }
}

// return the date of your server in ISO 8601
const newDate = () => new Date().toString()

// return a promise. Using when we need to check if a row exist via the id
function mustBeInArray(array, id) {
    return new Promise((resolve, reject) => {
        const row = array.find(r => r._id == id)
        if (!row) {
            reject({
                message: 'ID is not good',
                status: 404
            })
        }
        resolve(row)
    })
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
    getNewId,
    newDate,
    mustBeInArray,
    writeJSONFile
}