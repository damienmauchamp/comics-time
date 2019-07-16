const config = require('./config.js');
const https = require('https');
const querystring = require('querystring');

const API = function(config) {
	if (!(this instanceof API)) {
		return new API(config);
	}

	this.api_key = config.API_KEY;
	this.maj_api_key = config.MAJ_API_KEY;
	this.url = 'comicvine.gamespot.com';
	this.options = {};
	this.limit = 20;
	this.format = 'json';
}

// utils
API.prototype.get_prefixe = function (path) {
	switch(path.replace('/', '')) {
		case 'issue':
		return 4000;
		case 'volume':
		return 4050;
		default:
		return '';
	}
	return;
}

API.prototype.serialize = function (array, first = true) {
	var str = '';
	Object.keys(array).forEach(function(key) {
		// first param
		str += first ? '?' : '&';
		first = false;

		// filters
		if (typeof array[key] === "object") {
			str += (key + '=');
			var filters = array[key];
			var first_filter = true;
			Object.keys(filters).forEach(function(filters_key) {
				if (!first_filter) {
					str += ',';
				}
				str += (filters_key + ':' + querystring.escape(filters[filters_key]));
				first_filter = false;
			});
			str += str;
		} else {
			str += (key + '=' + querystring.escape(array[key]));
		}
	});
	return str;
}

API.prototype.set_options = function(path, id, query_params) {
	var prefixe = this.get_prefixe(path);
	if (!query_params.format) {
		query_params.format = this.format;
	}
	if (!query_params.limit && path.replace('/', '') === 'search') {
		query_params.limit = this.limit;
	}

	//console.log(path, id, query_params)

	this.options = {
		hostname: this.url,
		path: '/api/' + path.replace('/', '') + '/'
			+ ((id && prefixe) ? (prefixe + '-' + id + '/') : '') // {prefixe}-{id}
			+ '?api_key=' + this.api_key
			+ this.serialize(query_params, false),
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		};
		return;
	}

// requests
API.prototype.get = function (path, params, callback) {
	return this.request('GET', path, params, callback);
}

API.prototype.request = function (method, path, params, callback) {

	var id = null
	//console.log(method, path, params)
	//console.log(typeof params)
	if (typeof params === 'number') {
		id = params;
		params = {}
	} else if (typeof params === 'function') {
		callback = params
		params = {}
	}

	// setting options
	this.set_options(path, id, params);


	var data = '';
	//console.log(this.options)
	https.get(this.options, function(res) {
		res.on('data', function(chunk) {
			data += chunk;
		}).on('end', function() {
			var json = JSON.parse(data);
			callback(json.results);
		});
	}).on("error", (err) => {
		//console.log("Error: " + err.message);
	});

	return;
}

module.exports = new API(config)


/////////////

const API_tests = function() {

	const api = new API(config)

	// function
	this.search = function() {

		// params
		var params = {
			query: 'Avengers',
			resources: 'volume'
		}

		//
		//console.log("TEST: search()", 'search/', params)

		// search
		api.get('search/', params, function(data) {
			// DISPLAY
			// {name} {'Volume' || resource_type} {start_year} ({count_of_issues} issues) ({publisher.name})
			// Avengers Volume 2018 (19 issues) (Marvel)

			// {image->thumb_url}
			// img : https://static.comicvine.com/uploads/square_mini/6/67663/6406863-01.jpg



			//console.log(data);
		})
		return true;
	}

	this.issues = function() {

		// params
		var params = {
			filter: {
				volume: 110496
			}
		}

		//
		//console.log("TEST: issues()", 'issues/', params)

		api.get('issues/', params, function(issues) {

			// get issues in file
			const volume = params.filter.volume;

			issues.forEach(issue => {
				// if aleady in the file
					// check differences => changes + update
				// else
					// add to the volume entity
				console.log({
					id: issue.id,
					name: issue.name,
					issue_number: issue.issue_number,
					image: issue.image.original_url,
					store_date: issue.store_date,
					added: false,
					updated: false,
					read: false
				});
			})
		})
	}

	this.issue = function() {

		// params
		var issue = 668770

		//
		//console.log("TEST: issue()", 'issue/', issue)

		api.get('issue/', issue, function(data) {
			//console.log(data);
		})
	}

	this.volume = function() {

		// params
		var volume = 110496

		//
		//console.log("TEST: volume()", 'volume/', volume)
		
		api.get('volume/', volume, function(data) {
			//console.log(data);
		})
	}
}

////////////

/*module.exports = {
	api: new API(config),
	tests: new API_tests(config)
}*/
//var api = new API(config);





// issues (looking for all the issues of a volume)
// todo: if there're 100+ issues, need pagination
// maj example


/*

//https://comicvine.gamespot.com/api/issues/?api_key=XXXXXX&filter=volume:110496&format=json

*/

/*
var express = require("express");
var app = express();
var fs = require('fs');
*/
// INIT
/*
var file_content;
var stats = fs.statSync("data.json");
if (!stats.isFile()) {
	console.log("nonono");

	var test = {
		test: 'ok',
		aaah: 'kkakaka',
		h: 'afeknle'
	};

	fs.writeFile('data.json', JSON.stringify(test), function (err) {
		if (err) throw err;
		console.log('File is created successfully.');
	});
}*/


/*
app.get('/', function(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.send('Accueil');

	var test = {
		test: 'ok',
		aaah: 'kkakaka',
		h: 'afeknle'
	};
	console.log(
		test,
		JSON.stringify(test),
		JSON.parse(JSON.stringify(test)));
});

app.get('/search', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
    res.render('test.ejs', {test: req.params.test});
	res.send('test');
});

app.listen(3000);
*/