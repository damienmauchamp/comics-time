const express = require('express')
const router = express.Router()
var parseUrl = require('parseurl');
const comic = require('../models/comic.model')
const m = require('../helpers/middlewares')
const api = require('../api.js')

router.use('', function (req, res, next) {
    if (parseUrl.original(req).pathname !== req.baseUrl) return next(); // skip this for strictness
});

// homepage
// all comics
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

// get a comic
router.get('/comics/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id
    const page = 'comics';

    await comic.getComics(id)
    .then(function(comics) {
        res.render('includes/comic.ejs', {comic: comics, page: page})
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

// get an issue
//router.get('/comics/:id/issue/:id_issue', m.mustBeInteger, async (req, res) => {
router.get('/comics/:id/issue/:n', m.mustBeInteger, async (req, res) => {
    const id_comics = req.params.id
    const n = req.params.n
    const page = 'issue';

    await comic.getComics(id_comics)
    .then(function(comics) {
        res.render('includes/comic.ejs', {comic: comics, issue_number: n, page: page})
    })
    .catch(err => {
        if (err.status) {
            res.status(err.status).redirect('/comics/' + id_comics);
            //res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).redirect('/comics/' + id_comics);
            //res.status(500).json({ message: err.message })
        }
    })
})

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
router.post('/comics/add', m.mustBeInteger, async (req, res) => {
/*
curl -i -X POST \
-H "Content-Type: application/json" \
-d '{ "id": 112325 }' \
http://localhost:1337/comics/add
*/

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
router.put('/:id', m.mustBeInteger, m.checkFieldsPost, async (req, res) => {
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
router.delete('/:id', m.mustBeInteger, async (req, res) => {
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