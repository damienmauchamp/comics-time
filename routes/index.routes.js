const express = require('express')
const router = express.Router()

router.use('/api/v1/comics', require('./comic.routes'))

module.exports = router