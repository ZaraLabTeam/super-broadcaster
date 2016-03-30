// ================ DEPENEDENCIES =============================

// Project modules
var broadcaster = require('../broadcaster');
var bcConfigurator = require('../config/broadcaster-config');
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

			socket.on('broadcast-setConfig', bcConfigurator.setActiveConfig);

			socket.on('broadcast-addConfig', bcConfigurator.saveConfig);

			socket.on('broadcast-removeConfig', bcConfigurator.removeConfig);

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
				var configs = bcConfigurator.getSavedConfigs();
				callback(configs);
			}

			function getActive(callback) {
				var active = bcConfigurator.getActiveConfig();
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