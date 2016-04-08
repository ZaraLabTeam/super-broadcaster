var fs = require('fs');

var httpsOptions;

try {
	httpsOptions = {
		key: fs.readFileSync(__dirname + '/server.key'),
		cert: fs.readFileSync(__dirname + '/server.crt')
	};
} catch (err) {
	console.log(err.toString());
	console.log('###########################################################');
	console.log('Error reading ssl certificate. Will serve over HTTP instead');
	console.log('Place "server.key" and "server.crt" in the project config');
	console.log('folder to serve over HTTPS');
	console.log('###########################################################');
}

module.exports = {
	httpPort: process.env.port || 8002,
	wsPort: 8007,
	host: 'localhost',
	httpsOptions: httpsOptions
};
