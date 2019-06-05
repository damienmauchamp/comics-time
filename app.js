var config = require('./config.js');
const https = require('https');

var API = function(config) {
	if (!(this instanceof API)) {
		return new API(config);
	}

	this.api_key = config.API_KEY;
	this.maj_api_key = config.MAJ_API_KEY;
	this.url = 'comicvine.gamespot.com';
}

API.prototype.get = function (path, params, callback) {
	return this.request('GET', path, params, callback);
}

API.prototype.request = function (method, path, params, callback) {

	var self = this
	var id = null
	var prefixe = null

	if (typeof params === 'number') {
		id = params;
		params = {}
	} else if (typeof params === 'function') {
		callback = params
		params = {}
	}

	// prefixe (XXXX-)
	switch(path.replace('/', '')) {
		case 'issue':
			prefixe = 4000;
			break;
		case 'volume':
			prefixe = 4050;
			break;
	}

	params.format = 'json';

	var param = (id && prefixe) ? (prefixe + '-' + id + '/') : '';

	function serialize(array, first = true) {
		var str = '';
		Object.keys(array).forEach(function(key) {
			str += first ? '?' : '&';
			first = false;
			str += (key + "=" + array[key]);
		});
		return str;
	}

	var options = {
		hostname: self.url,
		path: '/api/' + path.replace('/', '') + '/'
			+ param
			+ '?api_key=' + self.api_key
			+ serialize(params, false),
		headers: {
			'User-Agent': 'Mozilla/5.0'
		}
	}

	const https = require('https');

	var data = '';
	https.get(options, function(res) {
		res.on('data', function(chunk) {
			data += chunk;
		}).on('end', function() {

			var json = JSON.parse(data);
			callback(json.results);

		})
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});

	return;
}




var api = new API(config);

// search
var search = {
	query: 'Avengers',
	resources: 'volume'
}/*
api.get('search/', search, function(data) {
	console.log(data);
})
// issue
api.get('issue/', 668770, function(data) {
	console.log(data);
})*/
// volume
api.get('volume/', 110496, function(data) {
	console.log(data);
})



/*
var express = require("express");
var app = express();

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send('Accueil');
});

app.listen(3000);
*/