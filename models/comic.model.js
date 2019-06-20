let posts = require('../data/comics.json')
const filename = './data/comics.json'
const helper = require('../helpers/helper.js')
const api = require('../api.js')

// COMICS
// getting all comics
function getAllComics() {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject({
                message: 'no comics available',
                status: 202
            })
        }

        resolve(posts)
    })
}

// getting a comics with an id
function getComics(id) {
    return new Promise((resolve, reject) => {
        helper.mustBeInArray(posts, id)
        .then(post => resolve(post))
        .catch(err => reject(err))
    })
}

function addComics(comic) {
    console.log(comic)
    return new Promise((resolve, reject) => {

        newComic = {
            _id: helper.getNewId(posts),
            id: comic.id,
            name: comic.name,
            nb_issues: comic.count_of_issues, // array
            issues: [], // array
            image: comic.image.original_url.replace('original', '{{code}}'),
            publisher: {
                id: comic.id,
                name: comic.name
            },
            start_year: comic.start_year,
            date: { 
                added: helper.newDate(),
                updated: helper.newDate()
            },
            active: true
        }

        //newPost = { ...id, ...date, ...newPost }
        posts.push(newComic)
        helper.writeJSONFile(filename, posts)
        resolve(newComic)
    })
}

// ISSUES
// getting all issues from a comic
Object.prototype.getIssues = function() {
    return new Promise((resolve, reject) => {
        if (typeof this.issues === "undefined" || this.issues.length === 0) {
            reject({
                message: 'no issues available',
                status: 202
            })
        }
        resolve(this.issues)
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
        helper.mustBeInArray(posts, id)
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
        helper.mustBeInArray(posts, id)
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
    addComics,

    insertPost,
    updatePost,
    deletePost
}