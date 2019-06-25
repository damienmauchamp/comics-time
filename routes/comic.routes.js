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


//GET /comics
// @todo


//GET /comics/:id
router.get('/comics/:id', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id
    const page = 'comics';

    await comic.getComics(id)
    .then(function(comics) {
        res.render('includes/comic.ejs', {page: page, comic: comics})
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
router.get('/comics/:id/issue/:id_issue', m.comicsIDMmustBeInteger, m.issueIDMustBeFloat, async (req, res) => {
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



//POST /comics/
//router.post('/comics', async (req, res) => 
//curl -i -X POST \
//-H "Content-Type: application/json" \
//-d '{ "id": 112325 }' \
//http://localhost:1337/comics/add
    /*
    curl -i -X POST \
    -H "Content-Type: application/json" \
    -d '{ "id": 112325 }' \
    -d '{ //DATA// }' \
    http://localhost:1337/comics/
    */
//})


// no surrender 110933
// life of captain marvel 112325

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
/*
life of captain marvel
curl -i -X POST \
-H "Content-Type: application/json" \
http://localhost:1337/comics/112325

no surrender
curl -i -X POST \
-H "Content-Type: application/json" \
http://localhost:1337/comics/110933

black panther
curl -i -X POST \
-H "Content-Type: application/json" \
http://localhost:1337/comics/111034
*/

//POST /comics/:id/issue

//POST /comics/:id/issues
// Add comics' issues using ComicVine volume ID



//PUT /comics/:id

//PUT /comics/:id/issue/:id_issue

//PUT /comics/:id/issues



//DELETE /comics/:id

//DELETE /comics/:id/issue/:n

//DELETE /comics/:id/issues



//GET /search




// search
router.get('/search/:query', async (req, res) => {
    const query = req.params.query

    var params = {
        query: query,
        resources: 'volume'
    }

    api.get('search/', params, function(results) {

        var display = [];
        results.forEach(function(e) {
            var template = "[" + e.id + "] " + e.name + " (" + e.start_year + ") (" + e.count_of_issues + " issues) [" + e.publisher.name + "]";
            // {name} {'Volume' || resource_type} {start_year} ({count_of_issues} issues) ({publisher.name})
            display.push(template);
        });
        res.json(display)
    });
})

// add comic /id
/*router.post('/comics/add', async (req, res) => {
*
curl -i -X POST \
-H "Content-Type: application/json" \
-d '{ "id": 112325 }' \
http://localhost:1337/comics/add
*

    var volume = req.body.id

    console.log('volume/', volume);

    //var 
    api.get('volume/', volume, async function(data) {
        await comic.addComics(data)
        .then(comic => res.status(201).json({
            message: `The comic #${comic.id} has been created`,
            content: comic
        }))
        .catch(err => res.status(500).json({ message: err.message }))
    })

})
*/





















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

/* Insert a new comic */
router.post('/', m.checkFieldsPost, async (req, res) => {
    await comic.insertPost(req.body)
    .then(comic => res.status(201).json({
        message: `The comic #${comic.id} has been created`,
        content: comic
    }))
    .catch(err => res.status(500).json({ message: err.message }))
})

/* Update a comic */
router.put('/:id', m.comicsIDMmustBeInteger, m.checkFieldsPost, async (req, res) => {
    const id = req.params.id

    await comic.updatePost(id, req.body)
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

/* Delete a comic */
router.delete('/:id', m.comicsIDMmustBeInteger, async (req, res) => {
    const id = req.params.id

    await comic.deletePost(id)
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

module.exports = router