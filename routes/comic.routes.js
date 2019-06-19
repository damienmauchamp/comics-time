const express = require('express')
const router = express.Router()
const post = require('../models/comic.model')
const m = require('../helpers/middlewares')

// homepage
// all comics
router.get('/', async (req, res) => {
    const page = 'homepage';

    await post.getAllComics()
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

    await post.getComics(id)
    //.then(post => res.json(post))
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

router.get('/tests', async (req, res) => {
    await post.getAllComics()
    .then(posts => res.json(posts))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})

// get an issue
router.get('/comics/:id/issue/:id_issue', m.mustBeInteger, async (req, res) => {
    const id_comics = req.params.id
    const id_issue = req.params.id_issue

    await post.getComics(id_comics)
    .then(post => res.json(post))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})



// olds

/* A post by id */
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
})

/* Insert a new post */
router.post('/', m.checkFieldsPost, async (req, res) => {
    await post.insertPost(req.body)
    .then(post => res.status(201).json({
        message: `The post #${post.id} has been created`,
        content: post
    }))
    .catch(err => res.status(500).json({ message: err.message }))
})

/* Update a post */
router.put('/:id', m.mustBeInteger, m.checkFieldsPost, async (req, res) => {
    const id = req.params.id

    await post.updatePost(id, req.body)
    .then(post => res.json({
        message: `The post #${id} has been updated`,
        content: post
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        res.status(500).json({ message: err.message })
    })
})

/* Delete a post */
router.delete('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id

    await post.deletePost(id)
    .then(post => res.json({
        message: `The post #${id} has been deleted`
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        res.status(500).json({ message: err.message })
    })
})

module.exports = router