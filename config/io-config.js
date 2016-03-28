function config(io) {
	io.configure(function() {
		io.enable('browser client minification');
		io.enable('browser client etag');
		io.set('log level', 1); // reduce logging
		io.set('transports', [
			'websocket',
			'xhr-polling',
			'jsonp-polling'
		]);
	});
}

module.exports.config = config;