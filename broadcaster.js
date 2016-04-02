// ================ DEPENDENCIES ================================

// NPM Dependencies
var avconv = require('avconv');

// Project modules
var presetsManager = require('./presets/presets-manager');
var logger = require('./logging/logger');
var secret = require('./secret');

// The stream process object will be stored here
var stream = null;

// ==============================================================

// Constants
var BROADCAST_STARTED_MSG = '============ Broadcast Started ============';
var BROADCAST_ENDED_MSG = '============ Broadcast Ended ============';
var BROADCAST_ABORTED_MSG = '============ Broadcast Aborted ============';
var CONFIGURATION_MSG = '============ Configuration ============ \n';

/**
 * Fires up a video stream from the shell with the last set configutation
 */
function broadcast() {
	var commandParams = prepareForBroadcast();
	if (!commandParams) return;

	stream = avconv(commandParams.split(' '));
	logStreamData(stream);

	logger.log(BROADCAST_STARTED_MSG);
}

function stopPreviousBroadcast() {
	if (stream) {
		stream.kill();
		stream = null;

		logger.log(BROADCAST_ENDED_MSG);
	}
}

function prepareForBroadcast() {
	var broadcastConfig = presetsManager.getActivePreset();

	broadcastConfig.command += (broadcastConfig.output === 'default' ? secret.output : broadcastConfig.output);

	var params = broadcastConfig.command;

	var message = CONFIGURATION_MSG +
		params + '\n' +
		CONFIGURATION_MSG;

	logger.log(message);
	stopPreviousBroadcast();

	return params;
}

function isRunning() {
	if (stream) {
		return true;
	}

	return false;
}

// ================ EXPORTS =====================================

module.exports = {
	broadcast: broadcast,
	stop: stopPreviousBroadcast,
	isRunning: isRunning
};

// ==============================================================

// ================ HELPERS =====================================

function logStreamData(stream) {
	stream.on('message', function(msg) {
		logger.streamLog(msg);

	});

	stream.on('error', function(err) {
		logger.log(err.toString());
	});

	stream.once('exit', function(exitCode, signal, metadata) {
		/*
		Here you know the avconv process is finished
		Metadata contains parsed avconv output as described in the next section
		*/

		logger.log('...broadcast received exit call');
	});
}

// ==============================================================