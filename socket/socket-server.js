// ================ DEPENDENCIES =============================

// Constants
// Copy & paste
var PORT = 8007;
var STREAM_MAGIC_BYTES = 'jsmp'; 

// NPM Modules
var socketServer = new (require('ws').Server)({port: PORT});

// Project Modules
var logger = require('../logging/logger');
var broadcaster = require('../broadcaster');

var width = 320;
var height = 240;

// ================================================================

// ================ IMPLEMENTATION =============================

socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);

	socket.send(streamHeader, {binary: true});

	logger.log('New WebSocket Connection ({{count}} total)'
			.formatPV({count: socketServer.clients.length}));

	socket.on('close', function(code, message) {
		logger.log('Disconnected WebSocket ({{count}} total)'
			.formatPV({count: socketServer.clients.length}));
	});
});

socketServer.broadcast = function(data, opts) {
	for(var i in this.clients) {
		if (this.clients[i].readyState === 1) {
			this.clients[i].send(data, opts);
		} else {
			logger.log('Error: Client ({{number}}) not connected.'
				.formatPV({number: i}));
		}
	}
};

broadcaster.event.on('broadcast-started', playStream);

function playStream(stream) {
	logger.log('Staring stream on port {{port}}'.formatPV({port: PORT}));

	stream.on('data', function(data) {
		socketServer.broadcast(data, {binary: true});
	});
}

// ================================================================