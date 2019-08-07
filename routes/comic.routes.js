const express = require('express')
const router = express.Router()

var parseUrl = require('parseurl');
const comic = require('../models/comic.model')
const m = require('../helpers/middlewares')
const api = require('../api.js')

const url = require('url');  

const moment = require('moment')

var options = {
    page: "default",
    main: "home",
    datatype: "html",
    lang: "en",

    // search
    search: {
        limit: 20
    },
    
    modules: {},


    image_code: 'scale_small'
}

//
// @todo
router.use('', function (req, res, next) {
    if (parseUrl.original(req).pathname !== req.baseUrl)
        return next(); // skip this for strictness
});

// GET /
// @todo
router.get('/', async (req, res) => {
    options.page = 'homepage';

    await comic.getAllComics()
    .then(function(comics) {

        comics = comics.map(c => ({
            ...c,

            // comics info
            image: c.image.replace('{{code}}', options.image_code),
            link: '/comics/' + c.id,

            // to read
            to_read: c.issues.find(function(i) {
                return !i.read;
            }) || false

        }))

        res.render('index.ejs', {comics: comics, options: options})
    })
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})

//POST /calendar/data ==> GET /calendar/data
router.post('/calendar/data', async (req, res, next) => {
    res.redirect(url.format({
        pathname:'/calendar/data',
        query: req.body
     }));
})

//GET /calendar
router.get('/calendar/:type*?', async (req, res, next) => {
    //var path = parseUrl.original(req).pathname.replace(/^\/+|\/+$/g, '');

    var default_days = 7*12, date_start, date_end;
    const days = !isNaN(req.query.days) && req.query.days <= default_days ? req.query.days : default_days;

    if (!req.params.type) { // /calendar
        var default_date_end = new Date().getTime();
        date_end = !isNaN(Date.parse(req.query.date_end)) ? req.query.date_end : default_date_end;

        var default_date_start = new Date(date_end).setDate(new Date(date_end).getDate() - days);
        date_start = !isNaN(Date.parse(req.query.date_start)) ? req.query.date_start : default_date_start;
    } else if (req.params.type === "data") { // /calendar/data

        if (typeof req.query.date === "undefined") {
            res.status(500).json({ message: "Aucune date transmise" })
            return
        }

        var date = Number(req.query.date)
        var direction = req.query.direction ? req.query.direction : 1

        if (direction > 0) {
            date_start = new Date(date).setDate(new Date(date).getDate() + 1);
            date_end = new Date(date).setDate(new Date(date).getDate() + days);
        } else if (direction < 0) {
            date_end = new Date(date).setDate(new Date(date).getDate() - 1);
            date_start = new Date(date).setDate(new Date(date).getDate() - days);
        } else {
            res.status(500).json({ message: "Direction non valide" })
            return
        }
    } else {
        next()
    }

    options.page = 'calendar';
    options.main = 'calendar';
    options.modules['moment'] = moment
    options.calendar = {
        min: {
            date: date_start,
            more: true
        },
        max: {
            date: date_end,
            more: true
        }
    }

    await comic.getCalendar(date_start, date_end)
    .then(issues => {

        // ordering by week
        var by_day = {}
        issues.forEach(i => {
            if (!by_day[i.store_date]) {
                by_day[i.store_date] = [];
            }
            by_day[i.store_date].push(i)
        })

        //options.calendar.(min|max).more = true|false
        
        if (req.params.type === "data") {
            res.status(200).json({calendar: by_day, options: options})
        } else {
            res.render('index.ejs', {calendar: by_day, options: options})
        }
    }).catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})

//GET /search
// @todo: pagination ?
router.get('/search', async (req, res) => {
    const query = req.query.q;

    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    var params = {
        query: query,

        options: options,
        //offset: offset,
        page: page,
        limit: limit,

        resources: 'volume'
    }
    console.log(page, params)

    api.get('search/', params, function(data) {

        comic.getAllComics()
        .then(comics => {
            var results = [];
            data.results.forEach(function(e) {
                results.push({
                    id: e.id,
                    name: e.name,
                    start_year: e.start_year,
                    count_of_issues: e.count_of_issues,
                    image: e.image.small_url, //scale_avatar, .replace('original', '{{code}}')
                    publisher: e.publisher ? e.publisher.name : '',
                    added: comics.find(c => c.id === e.id)
                });
            });

            var results_returned = (parseInt(data.offset) + 1) * parseInt(data.limit);
            var total_count = parseInt(data.number_of_total_results);

            res.json({
                pagination: {
                    more: results_returned < total_count
                },
                incomplete_results: false,
                total_count: total_count,
                results: results
            })
        })
        .catch(err => {
            if (err.status) {
                res.status(err.status).json({ message: err.message })
            } else {
                res.status(500).json({ message: err.message })
            }
        })

    });
})

//GET /update
router.get('/update', async(req, res) => {
    await comic.getAllComics()
    .then(function(comics) {
        res.status(200).json(comics.map(c => {
            return c.id
        }))
    }).catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})


//GET /comics
// @todo ?

//GET /comics/:id
router.get('/comics/:id', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id
    options.page = 'comics';

    await comic.getComics(id)
    .then(function(comics) {
        res.render('index.ejs', {options: options, comic: comics})
    })
    .catch(err => {
        if (err.status) {
            res.status(err.status).redirect('/');
            //res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).redirect('/');
            //res.status(500).json({ message: err.message })
        }
    })
})

//GET /comics/:id/issue/:id_issue
router.get('/comics/:id/issue/:id_issue', m.comicsIDMmustBeInteger, m.issueIDMustBeinteger, async (req, res) => {
    const id_comic = req.params.id
    const id_issue = req.params.id_issue
    options.page = 'issue';

    comic.getComics(id_comic)
    .then(function(item) {
        comic.getIssue(item.issues, id_issue)
        .then(issue => {
            issue.previous = comic.getPreviousIssue(item.issues, id_issue)
            issue.next = comic.getNextIssue(item.issues, id_issue)
            item.issue = issue
            res.status(200).json({options: options, comic: item})
        })
        .catch(err => {
            if (err.status) {
                //res.status(err.status).redirect('/comics/' + id_comics);
                res.status(err.status).json({ message: err.message })
            } else {
                //res.status(500).redirect('/comics/' + id_comics);
                res.status(500).json({ message: err.message })
            }
        })
    })
    .catch(err => {
        if (err.status) {
            //res.status(err.status).redirect('/comics/' + id_comics);
            res.status(err.status).json({ message: err.message })
        } else {
            //res.status(500).redirect('/comics/' + id_comics);
            res.status(500).json({ message: err.message })
        }
    })
})

//GET /comics/:id/issues
// @todo ?

//POST /read
router.post('/read', async (req, res) => {

    comic.readIssue(req.body)
    .then(function(item) {
        res.status(200).json(item)
    })
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })

    //console.log(req.body)
})

//POST /comics/:id
// Add comics using ComicVine volume ID
router.post('/comics/:id', m.comicsIDMmustBeInteger, async (req, res) => {

    // volume 
    var volume = parseInt(req.params.id)
    api.get('volume/', volume, async function(comics) {

        // issues
        var params = { filter: { volume: volume } }
        api.get('issues/', params, function(issues) {
            comic.addComics(comics, issues)
            .then(comic => {

                comic = {
                    ...comic,

                    // comics info
                    image: comic.image.replace('{{code}}', options.image_code),
                    link: '/comics/' + comic.id,

                    // to read
                    to_read: comic.issues.find(function(i) {
                        return !i.read;
                    })
                };


                res.send({ data: [
                    { comic: comic, options: options }
                ]});
                //res.send({ data: {comic: comic, options: options}});
                //console.log(comic);
                //res.render('includes/comic.ejs', {comic: comic, options: options})
                /*res.status(201).json({
                    message: `The comic #${comic.id} has been created`,
                    content: comic
                })*/
            })
            .catch(err => res.status(500).json({ message: err.message }))
        })
    })
})

//POST /comics/:id/issue
// @todo ?

//POST /comics/:id/issues
// Add comics' issues using ComicVine volume ID
// @todo ?

//PUT /comics/:id => edit comics' info
router.put('/comics/:id', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id

    await comic.editComics(id, req.body)
    .then(comic => res.json({
        message: `The comic #${id} has been updated`,
        content: comic
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        res.status(500).json({ message: err.message })
    })
})

//PUT /comics/:id/issues => fetch and edit comics' issues
// comics/:id/update ?
router.put('/comics/:id/issues', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id

    // volume 
    var volume = parseInt(req.params.id)
    api.get('volume/', volume, async function(comics) {

        // issues
        var params = { filter: { volume: volume } }
        api.get('issues/', params, function(issues) {
            comic.editComicsIssues(comics, issues)
            .then(comic => 
                res.status(200).json({
                    message: `The comic's issues has been edited`,
                    content: comic
                })
            )
            .catch(err => res.status(500).json({ message: err.message }))
        })
    })
})

//PUT /comics/:id/issue/:id_issue =>

//DELETE /comics/:id
// Remove comics using ComicVine volume ID
router.delete('/comics/:id', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id

    await comic.deleteComics(id)
    .then(comic => res.json({
        message: `The comic #${id} has been deleted`
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        res.status(500).json({ message: err.message })
    })

})

//DELETE /comics/:id/issue/:n

//DELETE /comics/:id/issues



router.get('/template/:template', async(req, res) => {
    const template = req.params.template
    options.page = 'homepage';

    var path = require('path');
    res.sendFile(path.resolve('views/includes/' + template));

    console.log(path.resolve('views/includes/' + template))
    //comic.ejs
})
















/*router.get('/tests', async (req, res) => {
    await comic.getAllComics()
    .then(posts => res.json(posts))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})*/

/*router.get('/tests/search', async (req, res) => {

    const tests = post.tests;

    await tests.search()
    .then(results => res.json(results))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})*/



// olds

/* A post by id 
router.get('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id

    await post.getPost(id)
    .then(post => res.json(post))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})*/

/** @todo: post -> comic */


module.exports = router