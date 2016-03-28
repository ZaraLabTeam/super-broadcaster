// ================ DEPENEDENCIES =============================

// Project modules
var broadcaster = require('../broadcaster');
var logger = require('../logger');

// Configs
var secret = require('../secret');

// ================================================================

// ================ IMPLEMENTATION =============================

// Todo: more secure connection

function handleIO(io) {
	logger.log('Client connected');

	io
		.of(secret.serverPass)
		.on('connection', function(socket) {

			socket.on('broadcast-start', broadcaster.broadcast);

			socket.on('broadcast-stop', broadcaster.stop);

			socket.on('broadcast-test', test);

			socket.on('disconnect', disconnect);

			socket.on('error', function(err) {
				logger.log(err.toString());
			});

			logger.on('message', function(msg) {
				socket.emit('message', msg);
			});

			logger.on('stream-log', function(msg) {
				socket.emit('stream-log', msg);
			});

			function disconnect() {
				logger.log('Client Disconnected');
			}

			function test(cfg) {
				var testStream = broadcaster.test(cfg);
				if (testStream) {
					testStream.on('data', function(data) {
						socket.emit('video', data);
					});
				} 
				else {
					logger.log('Sto tai prais -> niama testStream');
				}
			}
		});
}

// ================================================================

// ================ EXPORTS =======================================

module.exports = {
	handle: handleIO
};

// ================================================================