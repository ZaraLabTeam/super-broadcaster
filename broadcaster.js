// ================ DEPENDENCIES ================================

// NPM Dependencies
var avconv = require('avconv');

// Project modules
var broadcasterConfigurator = require('./config/broadcaster-config').factory;
var logger = require('./logger');
var secret = require('./secret');

// The stream process object will be stored here
var stream = null;

// ==============================================================

// Constants
var BROADCAST_STARTED_MSG = '============ Broadcast Started ============';
var BROADCAST_ENDED_MSG = '============ Broadcast Ended ============';
var BROADCAST_ABORTED_MSG = '============ Broadcast Aborted ============';
var CONFIGURATION_MSG = 'Configuration: \n';
var TESTING_MSG = '============ Broadcast Testing ============';

/**
 * Fires up a video stream from the shell with custom configuration
 */
function broadcast(cfg) {
	var broadcastCfg = prepareForBroadcast(cfg);
	if (!broadcastCfg) return;

	stopPreviousBroadcast();
	stream = createSream(broadcastCfg);

	logger.log(BROADCAST_STARTED_MSG);
}

function stopPreviousBroadcast() {
	if (stream) {
		stream.kill();
		stream = null;

		logger.log(BROADCAST_ENDED_MSG);
	}
}

function prepareForBroadcast(cfg) {
	var broadcastConfig;

	if (!cfg) {
		logger.log('Empty configuration, using default!');
		broadcastConfig = broadcasterConfigurator('default', secret.youtubeKey);
		return broadcastConfig;
	}

	if (cfg.key) {
		key = cfg.key;
	} else {
		logger.log('No key in configuration, using default key!');
		key = secret.youtubeKey;
		cfg.key = secret.youtubeKey;
	}

	try {
		broadcastConfig = broadcasterConfigurator(cfg, key);
	} catch (err) {
		logger.log(BROADCAST_ABORTED_MSG);
		logger.log(err.toString());
		logger.log('Correct the configuration and try again');
		logger.log(BROADCAST_ABORTED_MSG);

		return false;
	}

	var message = CONFIGURATION_MSG + broadcastConfig.toString();
	logger.log(message);

	stopPreviousBroadcast();

	return broadcastConfig;
}

function isRunning() {
	if (stream) {
		return true;
	}

	return false;
}

function test(cfg) {
	var broadcastCfg = prepareForBroadcast(cfg);
	if (!broadcastCfg) return;

	stopPreviousBroadcast();
	stream = createTestStream(broadcastCfg);

	logger.log(TESTING_MSG);

	return stream;
}

function createSream(cfg) {

	stream = avconv([
		'-f', 'video4linux2',
		'-s', cfg.inRes,
		'-i', cfg.video,
		'-filter:v', 'yadif',
		'-r', cfg.fps,
		'-g', cfg.fps * 2,
		'-f', 'alsa',
		'-ac', 2,
		'-i', cfg.audio,
		'-vcodec', cfg.vcodec,
		'-s', cfg.outRes,
		'-b:v', cfg.videoBitrate,
		'-acodec', cfg.acodec,
		'-ar', 44100,
		'-threads', 'auto', // 4,
		'-qscale', cfg.qscale,
		'-b:a', cfg.audioBitrate,
		'-bufsize', cfg.buffer,
		'-metadata', cfg.title ? formatString('title="{{title}}"', {
			title: cfg.title
		}) : 'title="Live Broadcast"',
		'-v', cfg.verbosity,
		'-f', cfg.format,
		'-y', formatString('{{output}}/{{key}}', {
			output: cfg.output,
			key: cfg.key
		})
	]);

	logStreamData(stream);

	return stream;
}

function createTestStream(cfg) {

	// No audio
	stream = avconv([
		'-f', 'video4linux2',
		'-s', cfg.inRes,
		'-i', cfg.video,
		'-r', cfg.fps,
		// '-f', 'alsa',
		// '-ac', 2,
		// '-i', cfg.audio,
		'-vcodec', 'vp8', // cfg.vcodec,
		'-s', cfg.outRes,
		'-b:v', cfg.videoBitrate,
		// '-acodec', 'libvorbis', // cfg.acodec,
		// '-ar', 44100,
		'-threads', 'auto', // 4,
		'-qscale', cfg.qscale,
		// '-b:a', cfg.audioBitrate,
		'-bufsize', cfg.buffer,
		'-metadata', cfg.title ? formatString('title="{{title}}"', {
			title: cfg.title
		}) : 'title="Live Broadcast"',
		'-v', cfg.verbosity,
		'-f', 'webm', // cfg.format,
		'-y', 'pipe:1'
	]);

	logStreamData(stream);

	return stream;
}

// ================ EXPORTS =====================================

module.exports = {
	broadcast: broadcast,
	test: test,
	stop: stopPreviousBroadcast,
	isRunning: isRunning
};

// ==============================================================

// ================ HELPERS =====================================

function formatString(str, args) {
	if (!args) return str;

	for (var arg in args) {
		str = str.replace(
			RegExp("\\{\\{" + arg + "\\}\\}", "gi"), args[arg]);
	}

	return str;
}

function logStreamData(stream) {
	stream.on('message', function(data) {
		logger.streamLog(data);
	});

	stream.on('error', function(data) {
		logger.log(data);
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