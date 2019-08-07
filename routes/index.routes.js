const express = require('express')
const router = express.Router()

router.use('/', require('./comic.routes'))
//API : //router.use('/api/v1/comics', require('./comic.routes'))


router.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});

module.exports = router