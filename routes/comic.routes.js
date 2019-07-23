const express = require('express')
const router = express.Router()

var parseUrl = require('parseurl');
const comic = require('../models/comic.model')
const m = require('../helpers/middlewares')
const api = require('../api.js')

//
// @todo
router.use('', function (req, res, next) {
    if (parseUrl.original(req).pathname !== req.baseUrl)
        return next(); // skip this for strictness
});

// GET /
// @todo
router.get('/', async (req, res) => {
    const page = 'homepage';

    await comic.getAllComics()
    .then(function(comics) {
        res.render('index.ejs', {comics: comics, page: page})
    })
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})

//GET /calendar
// @todo: pagination ?
// must be valid date
router.get('/calendar', async (req, res) => {
/*
CALENDAR
var date_start = "2019-04-01";
var date_end = "2019-06-31";
var res = [];
c.forEach(function(comic) {
    var issues = comic.issues.filter(i => date_start <= i.store_date && i.store_date <= date_end);
    issues.map(obj => (obj.comics = {id: comic.id, name: comic.name}));
    res = res.concat(issues);
})
res.sort((a, b) => new Date(a.store_date) - new Date(b.store_date));
console.log(res);
*/
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

        page: page,
        //offset: offset,
        limit: limit,

        resources: 'volume'
    }
    console.log(page, params)

    api.get('search/', params, function(data) {

/*
{
    "results":
        [
            {},
            {},
            {},
        ],
    "pagination":
        {
            "more": true
        },
    "incomplete_results":false,
    "total_count":45
}

--------

"error": "OK",
"limit": 10,
"offset": 0,
"number_of_page_results": 10,
"number_of_total_results": 787,
"status_code": 1,
"results": []


*/

        var results = [];
        data.results.forEach(function(e) {
            //var template = "[" + e.id + "] " + e.name + " (" + e.start_year + ") (" + e.count_of_issues + " issues) [" + e.publisher.name + "]";
            // {name} {'Volume' || resource_type} {start_year} ({count_of_issues} issues) ({publisher.name})
            results.push({
                id: e.id,
                name: e.name,
                start_year: e.start_year,
                count_of_issues: e.count_of_issues,
                image: e.image.icon_url, //.replace('original', '{{code}}')
                publisher: e.publisher ? e.publisher.name : ''
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

    });
})


//GET /comics
// @todo ?

//GET /comics/:id
router.get('/comics/:id', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id
    const page = 'comics';

    await comic.getComics(id)
    .then(function(comics) {
        res.render('index.ejs', {page: page, comic: comics})
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
    const page = 'issue';

    comic.getComics(id_comic)
    .then(function(item) {
        comic.getIssue(item.issues, id_issue)
        .then(issue => {
            issue.previous = comic.getPreviousIssue(item.issues, id_issue)
            issue.next = comic.getNextIssue(item.issues, id_issue)
            item.issue = issue
            res.status(200).json({page: page, comic: item})
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
            .then(comic => 
                res.status(201).json({
                    message: `The comic #${comic.id} has been created`,
                    content: comic
                })
            )
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
                res.status(201).json({
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