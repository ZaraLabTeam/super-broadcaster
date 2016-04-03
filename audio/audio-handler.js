// ================ DEPENDENCIES =============================

var binaryServer = require('binaryjs').BinaryServer;
var logger = require('../logging/logger');
var Speaker = require('speaker');

// ================================================================

// ================ IMPLEMENTATION =============================

var server = binaryServer({port: 8003});

server.on('connection', function (client) {
	logger.log('audio connection');

	client.on('stream', handleAudio);

	client.on('close', function() {
		logger.log('audio connection closed');
	});
});

function handleAudio(stream, meta) {
	logger.log('Stream starting... @{{sampleRate}}Hz'.formatPV(meta));

		stream.on('error', function (err) {
			logger.log(err);
		});

		stream.on('exit', function() {
			logger.log('Audio stream ended');
		});

	var speaker = new Speaker({
		channels: 2, // 2 channels
		bitDepth: 16, // 16-bit samples
		sampleRate: 44100 // 44,100 Hz sample rate
	});

	stream.pipe(speaker);
}

// ================================================================

// ================ EXPORTS =============================

module.exports = {
	handle: handleAudio
};

// ================================================================