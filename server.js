// ================ DEPENDENCIES ================================

// Configs
require('./config/extension-methods');
var serverConfig = require('./config/server-config');
var ioConfig = require('./config/io-config');

// NPM modules
var protocol = {};
var protocolName = serverConfig.httpsOptions ? 'https' : 'http';

protocol = require(protocolName);
var socketIo = require('socket.io');

// Project modules
var httpHandler = require('./http/httpHandler');
var ioHandler = require('./socket/ioHandler');
var logger = require('./logging/logger');
// require('./socket/socket-server');

// If on rapsbery enable the gpio module
// if (serverConfig.useGPIO) {
	require('./gpio/pwm');
// }

// ==============================================================

// ================ IMPLEMENTATION ==============================

if (serverConfig.preStartScript) {
	require('child_process').exec(serverConfig.preStartScript);
}

var server;
if (serverConfig.httpsOptions) {
	server = protocol.createServer(serverConfig.httpsOptions, httpHandler.handle);
} else {
	// Grabing audio from browser won't work over http for the most of the browsers
	server = protocol.createServer(httpHandler.handle);
}

server.listen(serverConfig.httpPort); // .listen(serverConfig.port, serverConfig.host);

var io = socketIo.listen(server);
// ioConfig.config(io);

ioHandler.handle(io);	

logger.logServerAddress(protocolName, serverConfig.httpPort);

// ================================================================
