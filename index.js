// Import packages
const express = require('express')
const morgan = require('morgan')

// App
const app = express()

// Morgan
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes/index.routes'))

// files
app.use('/static', express.static('public'));

// First route
/*app.get('/', function(req, res) {
	console.log(res);
	res.json({ message: 'Hello world' })
})*/

// Starting server
app.listen('1337')