var fs = require('fs');

module.exports = {
	httpPort: process.env.port || 8002,
	wsPort: 8007,
	host: 'localhost',
	options: {
		key: fs.readFileSync(__dirname + '/server.key'),
		cert: fs.readFileSync(__dirname + '/server.crt')
	}
};
