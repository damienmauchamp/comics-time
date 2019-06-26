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
                issues: setComicsIssues(item.issues, issues), // array
                image: helper.setImageUrl(item.image.original_url),
                publisher: {
                    id: item.publisher.id,
                    name: item.publisher.name
                },
                start_year: item.start_year,
                date: { 
                    added: helper.newDate(),
                    updated: helper.newDate()
                },
                active: true,
                extras: helper.getExtras('comics')
            }

            /*array_extras = {}
            const extras = 
            Object.assign(newComic, extras)
            console.log(newComic, extras)*/

            //newPost = { ...id, ...date, ...newPost }
            comics.push(newComic)
            helper.writeJSONFile(filename, comics)
        }
        resolve(newComic)
    })
}

function setComicsIssues(comicsIssues, issues) {
    comicsIssues.forEach(function(issue, index) {

        // looking for the issue in the array
        match = issues.find(i => i.id == issue.id)

        if (match) {
            this[index] = {
                id: match.id,
                name: match.name,
                issue_number: match.issue_number,
                image: helper.setImageUrl(match.image.original_url),
                store_date: match.store_date,
                date: {
                    added: helper.newDate(),
                    updated: helper.newDate()
                },
                read: false,
                extras: helper.getExtras('issues')
            }
        }
    }, comicsIssues);

    return comicsIssues
}


// put
function editComics(id, data) {
    const regex = /(?:https?:\/\/)?(?:comicvine\.gamespot\.com\/?)?(api\/?)?(image\/?)?((?:\w+)\/)?(?:\d+-\d+\.)?(?:jpg)?/
    return new Promise((resolve, reject) => {
        helper.comicsMustBeInArray(comics, id)
        .then(comic => {

            const index = comics.findIndex(c => c.id == comic.id)

            // name
            if (comics[index].name !== data.name) {
                comics[index].name = data.name
            }
            
            // nb_issues
            if (comics[index].nb_issues !== data.nb_issues) {
                comics[index].nb_issues = data.nb_issues
            }
            
            // image, if comicvine, if original_url
            /*if ((typeof data.image !== "undefined" || typeof data.image.original_url !== "undefined") && (typeof data.image === "string" || typeof data.image.original_url === "string") && (comics[index].image !== data.image || comics[index].image !== data.image.original_url)) {
                var img = typeof data.image !== "undefined" && typeof data.image === "string" ? data.image : (typeof data.image !== "undefined" && typeof data.image.original_url !== "undefined" && typeof data.image.original_url === "string" ? data.image.original_url : null)
                if (img !== null) {
                    if (img.match(regex)) {
                        img = helper.setImageUrl(img);
                    }
                    comics[index].image = img
                }
            }*/

            // date
            if (typeof data.date !== "undefined" && typeof data.date.added !== "undefined") {
                comics[index].date.added === data.date.added
            }
            comics[index].date.updated === helper.newDate()

            // active
            if (comics[index].active !== data.active) {
                comics[index].active = data.active
            }

            if (typeof data.extras !== "undefined") {
                comics[index].extras = helper.getExtras('comics', data.extras, comics[index].extras)
            }

            helper.writeJSONFile(filename, comics)
            resolve(comics[index])
        })
        .catch(err => reject(err))
    })
}


// delete
function deleteComics(id) {
    return new Promise((resolve, reject) => {
        helper.comicsMustBeInArray(comics, id)
        .then(() => {
            comics = comics.filter(c => c.id !== parseInt(id))
            helper.writeJSONFile(filename, comics)
            resolve()
        })
        .catch(err => reject(err))
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


    addComics,

    editComics,

    deleteComics
}