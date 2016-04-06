// ================ DEPENDENCIES ================================

// Configs
require('./config/extension-methods');
var serverConfig = require('./config/server-config');
var ioConfig = require('./config/io-config');

// NPM modules
var http = require('http');
var socketIo = require('socket.io');

// Project modules
var httpHandler = require('./http/httpHandler');
var ioHandler = require('./socket/ioHandler');
var logger = require('./logging/logger');
// require('./socket/socket-server');

// ==============================================================

// ================ IMPLEMENTATION ==============================

var http_serv = http.createServer(httpHandler.handle)
	.listen(serverConfig.httpPort); // .listen(serverConfig.port, serverConfig.host);

var io = socketIo.listen(http_serv);
// ioConfig.config(io);

ioHandler.handle(io);	

console.log('running on port -> ' + serverConfig.httpPort);

// ================================================================
