const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
// require('dotenv').config();

// console.log('process.env', process.env);

module.exports = {
	API_KEY: process.env.API_KEY,
	MAJ_API_KEY: process.env.MAJ_API_KEY || process.env.API_KEY,
	ENV: process.env.ENVIRONMENT || 'prod',
	HTTP_PORT: process.env.HTTP_PORT || '9080',
	HTTPS_PORT: process.env.HTTPS_PORT || '9443',
	PRIVATE_KEY: process.env.PRIVATE_KEY || '',
	CERTIFICATE: process.env.CERTIFICATE || '',
	ADDONS_JS: process.env.ADDONS_JS || 'addons',
	URL_PATHNAME: process.env.URL_PATHNAME || '',

	// You can add any params
	PARAMS: {
		token: process.env.TOKEN ? process.env.TOKEN : ''
	}
}