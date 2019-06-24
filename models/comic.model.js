let comics = require('../data/comics.json')
const filename = './data/comics.json'
const helper = require('../helpers/helper.js')
const api = require('../api.js')

// COMICS
// getting all comics
function getAllComics() {
    return new Promise((resolve, reject) => {
        if (comics.length === 0) {
            reject({
                message: 'no comics available',
                status: 202
            })
        }
        resolve(comics)
    })
}

// getting a comics with an id
function getComics(id) {
    return new Promise((resolve, reject) => {
        helper.comicsMustBeInArray(comics, id)
        .then(item => resolve(item))
        .catch(err => reject(err))
    })
}

function getIssue(array, id) {
    return new Promise((resolve, reject) => {
        helper.issueMustBeInArray(array, id)
        .then(function(issue) {
            resolve(issue)
        })
        //.then(issue => resolve(issue))
        .catch(err => reject(err))
    })
}

function getPreviousIssue(array, id) {
    return getNearestIssue(array, id, 'prev')
}

function getNextIssue(array, id) {
    return getNearestIssue(array, id, 'next')
}

function getNearestIssue(array, id, way) {
    var index = array.indexOf(array.find(r => r.id == id)) + (1 * (way === 'prev' ? -1 : 1));
    return typeof array[index] !== "undefined" ? array[index] : null
}


// add
function addComics(item, issues) {
    return new Promise((resolve, reject) => {

        if (comics.find(c => c.id == item.id)) {
            reject({
                message: 'comics already added',
                status: 202
            })
        } else {
            newComic = {
                _id: helper.getNewId(comics),
                id: item.id,
                name: item.name,
                nb_issues: item.count_of_issues, // array
                issues: [], // array
                image: item.image.original_url.replace('original', '{{code}}'),
                publisher: {
                    id: item.id,
                    name: item.name
                },
                start_year: item.start_year,
                date: { 
                    added: helper.newDate(),
                    updated: helper.newDate()
                },
                active: true
            }

            //newPost = { ...id, ...date, ...newPost }
            comics.push(newComic)
            helper.writeJSONFile(filename, comics)
        }
        resolve(newComic)
    })
}


// olds

function insertPost(newPost) {
    return new Promise((resolve, reject) => {
        const id = { id: helper.getNewId(posts) }
        const date = { 
            createdAt: helper.newDate(),
            updatedAt: helper.newDate()
        } 
        newPost = { ...id, ...date, ...newPost }
        posts.push(newPost)
        helper.writeJSONFile(filename, posts)
        resolve(newPost)
    })
}

function updatePost(id, newPost) {
    return new Promise((resolve, reject) => {
        helper.comicsMustBeInArray(posts, id)
        .then(post => {
            const index = posts.findIndex(p => p.id == post.id)
            id = { id: post.id }
            const date = {
                createdAt: post.createdAt,
                updatedAt: helper.newDate()
            } 
            posts[index] = { ...id, ...date, ...newPost }
            helper.writeJSONFile(filename, posts)
            resolve(posts[index])
        })
        .catch(err => reject(err))
    })
}

function deletePost(id) {
    return new Promise((resolve, reject) => {
        helper.comicsMustBeInArray(posts, id)
        .then(() => {
            posts = posts.filter(p => p.id !== id)
            helper.writeJSONFile(filename, posts)
            resolve()
        })
        .catch(err => reject(err))
    })
}

module.exports = {
    getAllComics,
    getComics,
    getIssue,
    getPreviousIssue,
    getNextIssue,


    addComics
}