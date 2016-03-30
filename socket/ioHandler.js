// ================ DEPENEDENCIES =============================

// Project modules
var broadcaster = require('../broadcaster');
var presetsManager = require('../presets/presets-manager');
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

			socket.on('broadcast-setConfig', presetsManager.setActivePreset);

			socket.on('broadcast-addConfig', presetsManager.savePreset);

			socket.on('broadcast-removeConfig', presetsManager.removePreset);

			socket.on('broadcast-getConfigs', getConfigs);

			socket.on('broadcast-getActiveConfig', getActive);

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

			function getConfigs(callback) {
				var configs = presetsManager.getSavedPresets();
				callback(configs);
			}

			function getActive(callback) {
				var active = presetsManager.getActivePreset();
				callback(active);
			}
		});
}

// ================================================================

// ================ EXPORTS =======================================

module.exports = {
	handle: handleIO
};

// ================================================================
