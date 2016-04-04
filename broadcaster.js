// ================ DEPENDENCIES ================================

// NPM Dependencies
var avconv = require('avconv');
var EventEmitter = require('events').EventEmitter;

// Project modules
var presetsManager = require('./presets/presets-manager');
var logger = require('./logging/logger');
var secret = require('./secret');

// The stream process object will be stored here
var broadcastStream = null;

// emits the broadcast started event with the stream
var ev = new EventEmitter();

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

	broadcastStream = avconv(commandParams.split(' '));
	logStreamData(broadcastStream);

	ev.emit('broadcast-started', broadcastStream);
	logger.log(BROADCAST_STARTED_MSG);
}

function stopPreviousBroadcast() {
	if (broadcastStream) {
		broadcastStream.kill();
		broadcastStream = null;

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
	if (broadcastStream) {
		return true;
	}

	return false;
}

function addAudioStream(stream) {
	if (broadcastStream) {
		stream.pipe(broadcastStream);
	}
}

// ================ EXPORTS =====================================

module.exports = {
	broadcast: broadcast,
	stop: stopPreviousBroadcast,
	isRunning: isRunning,
	addAudioStream: addAudioStream,
	event: ev
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