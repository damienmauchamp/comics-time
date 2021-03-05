// Import config
const config = require('./config.js');

// SSL if the certificate and the key are found
const ssl = config.PRIVATE_KEY && config.CERTIFICATE;

if (ssl) {
	var fs = require('fs');
	var http = require('http');
	var https = require('https');
	var privateKey  = fs.readFileSync(config.PRIVATE_KEY, 'utf8');
	var certificate = fs.readFileSync(config.CERTIFICATE, 'utf8');
	var credentials = {key: privateKey, cert: certificate};
}

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

// view engine setup
const path = require('path');
// app.engine('html', require('ejs').renderFile);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use(require('./routes/index.routes'))

// files
app.use(favicon(__dirname + '/public/favicon.ico'))
//app.use(favicon(__dirname + '/public/images/logo_64.png'))
//app.use('/static', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

// Starting server
if (ssl) {
	var httpServer = http.createServer(app);
	var httpsServer = https.createServer(credentials, app);

	httpServer.listen(config.HTTP_PORT);
	httpsServer.listen(config.HTTPS_PORT);

	console.log('Starting server')
	console.log(`HTTP on port ${config.HTTP_PORT}`)
	console.log(`HTTPS on port ${config.HTTPS_PORT}`)
} else {
	app.listen(config.HTTP_PORT)
	console.log(`Starting server on port ${config.HTTP_PORT}`)
}

//
