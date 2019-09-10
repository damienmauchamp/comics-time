const config = require('../config.js');
const file_end = config.env === "dev" ? "_dev" : "";
let comics = require('../data/comics'+file_end+'.json')
const filename = './data/comics'+file_end+'.json'
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
        resolve(comics.sort((a, b) => { return a.date.updated < b.date.updated; }))
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
                    id: item.publisher.id ? item.publisher.id : '',
                    name: item.publisher.name ? item.publisher.name : ''
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
            /** @todo: make a function */
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
            //console.log(comics[index].active, comic.active)

            // active
            const isActive = comics[index].active

            // name
            if (typeof data.name !== 'undefined' && comics[index].name !== data.name) {
                console.log('EDIT: name from "' + comics[index].name + '" to "' + data.name + '"')
                comics[index].name = data.name
            } /*else {
                console.log('----: name ==> "' + comics[index].name + '"')
            }*/
            
            // nb_issues
            if (typeof data.count_of_issues !== 'undefined' && comics[index].nb_issues !== data.count_of_issues) {
                console.log('EDIT: nb_issues from "' + comics[index].nb_issues + '" to "' + data.count_of_issues + '"')
                comics[index].nb_issues = data.count_of_issues
            } /*else {
                console.log('----: nb_issues ==> "' + comics[index].nb_issues + '"')
            }*/
            
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
                console.log('ADDED: date.added = "' + data.date.added + '"')
                comics[index].date.added === data.date.added
            } /*else {
                console.log('----: date.added ==> "' + comics[index].date.added + '"')
            }*/
            comics[index].date.updated === helper.newDate()

            // active
            /*if (comics[index].active !== data.active) {
                comics[index].active = data.active
                console.log('EDIT: active from "' + comics[index].active + '" to "' + data.active + '"')
            } else {
                console.log('----: active ==> "' + comics[index].active + '"')
            }*/

            if (typeof data.extras !== "undefined") {
                comics[index].extras = helper.getExtras('comics', data.extras, comics[index].extras)
            }
            //comics[index].active = isActive

            helper.writeJSONFile(filename, comics)
            resolve(comics[index])
        })
        .catch(err => reject(err))
    })
}

function editComicsIssues(item, issues) {
    return new Promise((resolve, reject) => {
        comic = comics.find(c => c.id == item.id);

        if (!comic) {
            reject({
                message: 'comics not found',
                status: 202
            })
        } else {

            /*// nb_issues
            if (comics[index].nb_issues !== data.nb_issues) {
                comics[index].nb_issues = data.nb_issues
            }*/

            // comic : entité du fichier
            // item : comics de cv
            // issues : issues de cv

            // editing comics' info
            editComics(comic.id, item)

            // editing issues' info
            issues.forEach(function(issue, index) {
                match = comic.issues.find(i => i.id == issue.id)
                if (!match) {

                    /** @todo: make a function */
                    const newIssue = {
                        id: issue.id,
                        name: issue.name,
                        issue_number: issue.issue_number,
                        image: helper.setImageUrl(issue.image.original_url),
                        store_date: issue.store_date,
                        date: {
                            added: helper.newDate(),
                            updated: helper.newDate()
                        },
                        read: false,
                        extras: helper.getExtras('issues')
                    }

                    console.log("nouvelle issue", newIssue)
                    comic.issues.push(newIssue)
                }
            })

            comic.date.updated === helper.newDate()

            /*console.log("item", item, "\n\n\n\n\n", "issues", issues)
            Object.keys(comic.issues).forEach(function (key) {
                console.log(comic.issues[key].id)
            })*/


            //comic
            /*comic = {
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

            comics.push(comic)*/
            helper.writeJSONFile(filename, comics)
        }
        resolve(comic)
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

function readIssue(params) {
    return new Promise((resolve, reject) => {
        helper.comicsMustBeInArray(comics, params.comics)
        .then(comic => {

            var image_code = 'scale_small';
            var result = {}

            const comics_index = comics.findIndex(c => c.id == comic.id)

            const issue_index = comic.issues.findIndex(r => r.id == params.issue)

            comics[comics_index].issues[issue_index].read = params.date

            next = getNextIssue(comic.issues, params.issue)

            if (!next) {
                result = {
                    comics: comic.id,
                    issues_left: 0,
                    progress: 100,
                    img: comic.image.replace('{{code}}', image_code),
                    complete: true
                }
            } else {
                
                // last read
                var last_read_issue = comic.issues.reduce((prev, current) => (new Date(prev.read) > new Date(current.read)) ? prev : current);
                var last_read = last_read_issue.issue_number;
                // to be read
                var issues_left = comic.issues.filter(i => { return !i.read && i.id !== next.id && new Date() >= new Date(i.store_date); }).length;
                // release less than a week ago
                var is_new = Math.floor(Math.abs(new Date(next.store_date) - new Date()) / 1000 / 86400) < 7;
                // img
                var issue_img = next.image.replace('{{code}}', image_code);

                result = {
                    comics: comic.id,
                    issue: next.id,
                    issue_number: next.issue_number,
                    issues_left: issues_left,
                    //progress: last_read/comic.nb_issues*100,
                    progress:  (comic.nb_issues-issues_left-1)/comic.nb_issues*100,
                    img: issue_img,
                    new: is_new,
                    complete: false
                }
            }

            helper.writeJSONFile(filename, comics)
            resolve(result)
        }).catch(err => reject(err))
    })
}

function getCalendar(date_start, date_end) {
    return new Promise((resolve, reject) => {
        const start = new Date(date_start).setHours(0,0,0,0);
        const end = new Date(date_end).setHours(23,59,59,99);

        //console.log(new Date('2019-01-01').getTime(), start < end)
        //console.log(new Date('2019-01-01'), new Date(date_start), new Date(date_end))

        var res = [];
        comics.forEach(function(comic) {
            var issues = comic.issues.filter(i => start <= new Date(i.store_date).getTime() && new Date(i.store_date).getTime() <= end);
            issues.map(obj => (obj.comics = {id: comic.id, name: comic.name}));
            res = res.concat(issues);
        })
        res.sort((a, b) => new Date(a.store_date) - new Date(b.store_date));
        resolve(res);
    })
}


module.exports = {
    getAllComics,
    getComics,
    getIssue,
    getPreviousIssue,
    getNextIssue,

    readIssue,


    addComics,

    editComics,

    deleteComics,

    editComicsIssues,

    getCalendar
}