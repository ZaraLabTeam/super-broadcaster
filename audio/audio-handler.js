// ================ DEPENDENCIES =============================

// NPM Modules
var binaryServer = require('binaryjs').BinaryServer;
var dgram = require('dgram');

// Project Modules
var logger = require('../logging/logger');
var Speaker = require('speaker');
var broadcaster = require('../broadcaster');

// ================================================================

// ================ IMPLEMENTATION =============================

// This is commented out because we now use socket.io.stream but it seems there 
// isn't an advantage
// var server = binaryServer({
// 	port: 8003
// });
var client = dgram.createSocket('udp4');

// server.on('connection', function(client) {
// 	logger.log('audio connection');

// 	client.on('stream', handleAudio);


// });

client.on('close', function() {
	logger.log('audio connection closed');
	client.close();
});

function handleAudio(stream, meta) {
	logger.log('Stream starting... @{{sampleRate}}Hz'.formatPV(meta));

	broadcaster.addAudioStream(stream);
	// stream.on('data', function(data) {
	// 	// console.log(data.length);
	// 	var message = new Buffer(data);
	// 	client.send(message,0, message.length, 8005, 'localhost', function(err, bytes) {
	// 		if (err) {
	// 			logger.log(err.toString());
	// 		}
	// 	});
	// });

	stream.on('error', function(err) {
		logger.log(err);
	});

	stream.on('exit', function() {
		logger.log('Audio stream ended');
	});

	// Outputs to the server speakers 
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