const path = require('path');
//require('dotenv').config({ path: path.resolve(__dirname, './.env') });
require('dotenv').config();

module.exports = {
	API_KEY: process.env.API_KEY,
	MAJ_API_KEY: process.env.MAJ_API_KEY ? process.env.API_KEY : process.env.API_KEY,
	ENV: process.env.ENV ? process.env.ENV : '',

	// You can add any params
	PARAMS: {
		token: process.env.TOKEN ? process.env.TOKEN : ''
	}
}