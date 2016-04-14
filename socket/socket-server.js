/* ================ DESCRIPTION =============================
*
* This package is used to stream video through websockets to the
* Client Control Panel App
*
* =========================================================== */

// ================ DEPENDENCIES ============================= 

// Constants
// Copy & pasted
var STREAM_MAGIC_BYTES = 'jsmp';

// Project Modules
var config = require('../config/server-config');
var logger = require('../logging/logger');
var broadcaster = require('../broadcaster');

// NPM Modules
var socketServer = new(require('ws').Server)({
	port: config.wsPort
});

var width = 640;
var height = 480;

// ================================================================

// ================ IMPLEMENTATION =============================

socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);

	socket.send(streamHeader, {
		binary: true
	});

	logger.log('New WebSocket Connection ({{count}} total)'
		.formatPV({
			count: socketServer.clients.length
		}));

	socket.on('close', function(code, message) {
		logger.log('Disconnected WebSocket ({{count}} total)'
			.formatPV({
				count: socketServer.clients.length
			}));
	});
});

socketServer.broadcast = function(data, opts) {
	for (var i in this.clients) {
		if (this.clients[i].readyState === 1) {
			this.clients[i].send(data, opts);
		} else {
			logger.log('Error: Client ({{number}}) not connected.'
				.formatPV({
					number: i
				}));
		}
	}
};

broadcaster.event.on('broadcast-started', playStream);

function playStream(stream) {
	logger.log('Staring stream on port {{port}}'.formatPV({
		port: config.wsPort
	}));

	stream.on('data', function(data) {
		socketServer.broadcast(data, {
			binary: true
		});
	});
}

// ================================================================