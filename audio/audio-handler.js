// ================ DEPENDENCIES =============================

// Project Modules
var logger = require('../logging/logger');
var broadcaster = require('../broadcaster');

// ================================================================

// ================ IMPLEMENTATION =============================

var bcStream;
var aStream;

broadcaster.event.on('broadcast-started', function(broadcastStream) {
	bcStream = broadcastStream;

	if (aStream) {
		aStream.pipe(bcStream);
	}
});

function handleAudio(audioStream, meta) {
	logger.log('Stream starting... @{{sampleRate}}Hz'.formatPV(meta), 'warning');
	aStream = audioStream;

	if (bcStream) {
		audioStream.pipe(bcStream);
	} else {
		logger.log('Audio Received -> Start Broadcast', 'warning');
		broadcaster.broadcast();
	}

	audioStream.on('error', function(err) {
		logger.log(err.toString(), 'danger');
		if (bcStream) {
			audioStream.unpipe(bcStream);
			audioStream = null;
		}
	});

	audioStream.once('end', function() {
		logger.log('Audio stream ended', 'warning');
		if (bcStream) {
			audioStream.unpipe(bcStream);
			audioStream = null;
		}
	});
}

// ================================================================

// ================ EXPORTS =============================

module.exports = {
	handle: handleAudio
};

// ================================================================