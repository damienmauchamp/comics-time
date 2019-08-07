// Import packages
const express = require('express')
const morgan = require('morgan')
const favicon = require('serve-favicon');

// App
const app = express()

// Morgan
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// files
//app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(favicon(__dirname + '/public/images/logo_tmp.png'))
//app.use('/static', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.use(require('./routes/index.routes'))

// Starting server
app.listen('1337')