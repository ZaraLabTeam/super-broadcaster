// ================ DEPENEDENCIES =============================

// NPM modules
var ss = require('socket.io-stream');

// Project modules
var broadcaster = require('../broadcaster');
var audioHandler = require('../audio/audio-handler');
var presetsManager = require('../presets/presets-manager');
var logger = require('../logging/logger');

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

			ss(socket).on('audio-stream', audioHandler.handle);

			socket.on('broadcast-start', broadcaster.broadcast);

			socket.on('broadcast-stop', broadcaster.stop);

			socket.on('broadcast-setConfig', presetsManager.setActivePreset);

			socket.on('preset-add', presetsManager.savePreset);

			socket.on('preset-remove', presetsManager.removePreset);

			socket.on('broadcast-getConfigs', getConfigs);

			socket.on('preset-getByName', getPreset);

			socket.on('log-cpu', logger.toggleCpuLogging.bind(logger));

			socket.on('disconnect', disconnect);

			socket.on('error', function(err) {
				logger.log(err.toString());
			});

			logger.on('general-log', function(msg) {
				socket.emit('general-log', msg);
			});

			logger.on('stream-log', function(msg) {
				console.log('io -> ', msg);
				socket.emit('stream-log', msg);
			});

			logger.on('cpu-log', function(percentage) {
				socket.emit('cpu-log', percentage);
			});

			logger.on('memory-log', function(percentage) {
				socket.emit('memory-log', percentage);
			});

			function disconnect() {
				logger.log('Client Disconnected');
			}

			function getConfigs(callback) {
				var configs = presetsManager.getSavedPresets();
				callback(configs);
			}

			function getPreset(name, callback) {
				var preset = presetsManager.getPreset(name);

				if (preset) {
					callback(null, preset);
				} else {
					callback('Preset was not present on the server');
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
