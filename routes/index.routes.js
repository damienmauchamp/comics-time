const express = require('express')
const router = express.Router()

router.use('/', require('./comic.routes'))
//API : //router.use('/api/v1/comics', require('./comic.routes'))

module.exports = router