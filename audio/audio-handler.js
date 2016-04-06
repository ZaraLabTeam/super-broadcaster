// ================ DEPENDENCIES =============================

var Speaker = require('speaker');

// Project Modules
var logger = require('../logging/logger');
var broadcaster = require('../broadcaster');

// ================================================================

// ================ IMPLEMENTATION =============================

var bcStream;

broadcaster.event.on('broadcast-started', function(broadcastStream) {
	logger.log('bc stream received');
	bcStream = broadcastStream;
});

function handleAudio(audioStream, meta) {
	logger.log('Stream starting... @{{sampleRate}}Hz'.formatPV(meta));
	console.log(meta);

	if (bcStream) {
		audioStream.pipe(bcStream);
	}

	broadcaster.event.on('broadcast-started', function(broadcastStream) {
		audioStream.pipe(broadcastStream);
	});

	audioStream.on('error', function(err) {
		logger.log(err);
	});

	audioStream.on('exit', function() {
		logger.log('Audio stream ended');
	});

	// Outputs to the server speakers 
	// var speaker = new Speaker({
	// 	channels: 2, // 2 channels
	// 	bitDepth: 16, // 16-bit samples
	// 	sampleRate: 44100 // 44,100 Hz sample rate
	// });

	// audioStream.pipe(speaker);
}

// ================================================================

// ================ EXPORTS =============================

module.exports = {
	handle: handleAudio
};

// ================================================================