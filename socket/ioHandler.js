// ================ DEPENEDENCIES =============================

// Project modules
var broadcaster = require('../broadcaster');
var broadcasterConfigurator = require('../config/broadcaster-config');

// Configs
var broadcastConfig = null;
var secret = require('../secret');

// ================================================================

// ================ IMPLEMENTATION =============================

// Constants
var BROADCAST_STARTED_MSG = 'Broadcasting with the following configuration: \n';

// Todo: secure connection && video preview on page


function handleIO(io) {
	console.log('client connected');

	io.on('connection', function(socket) {

		socket.on('broadcast-config', bcConfig);

		socket.on('broadcast-start', broadcast);

		socket.on('broadcast-stop', stop);

		socket.on('disconnect', disconnect);

		function disconnect() {
			console.log('client disconnected');
		}

		function broadcast() {
			if (!broadcastConfig) {
				broadcastConfig = broadcasterConfigurator.configure('medium', secret.youtubeKey);
			}

			stop();

			running = broadcaster.broadcast(broadcastConfig);
			console.log('=============== Davat te po TV ===============');
			console.log(BROADCAST_STARTED_MSG, broadcastConfig.toString());
			socket.emit('message', BROADCAST_STARTED_MSG + broadcastConfig.toString());
		}

		function stop() {
			if (broadcaster.isRunning()) {
				console.log('=============== Broadcast Stopped ===============');
				broadcaster.stop();
			}
		}

		function bcConfig(cfg, key) {

			if (cfg.key) {
				key = cfg.key;
			}

			if (!key) {
				key = secret.youtubeKey;
			}

			broadcastConfig = broadcasterConfigurator.configure(cfg, key);
		}
	});
}

// ================================================================

// ================ EXPORTS =======================================

module.exports = {
	handle: handleIO
};

// ================================================================