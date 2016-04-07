// ================ DEPENDENCIES =============================

// Project Modules
var logger = require('../logging/logger');
var broadcaster = require('../broadcaster');

// ================================================================

// ================ IMPLEMENTATION =============================

var bcStream;
var aStream;

broadcaster.event.on('broadcast-started', function(broadcastStream) {
	logger.log('bc stream received');
	bcStream = broadcastStream;

	if (aStream) {
		aStream.pipe(bcStream);
	}
});

function handleAudio(audioStream, meta) {
	logger.log('Stream starting... @{{sampleRate}}Hz'.formatPV(meta));
	aStream = audioStream;

	if (bcStream) {
		audioStream.pipe(bcStream);
	} 

	audioStream.on('error', function(err) {
		logger.log(err.toString());
	});

	audioStream.once('exit', function() {
		logger.log('Audio stream ended');
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