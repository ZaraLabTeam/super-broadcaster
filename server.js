// ================ DEPENDENCIES ================================

// NPM modules
var http = require('http');
var socketIo = require('socket.io');

// Project modules
var httpHandler = require('./http/httpHandler');
var ioHandler = require('./socket/ioHandler');
var logger = require('./logger');

// Configs
var serverConfig = require('./config/server-config');
var ioConfig = require('./config/io-config');

// ==============================================================

// ================ IMPLEMENTATION ==============================

var http_serv = http.createServer(httpHandler.handle)
	.listen(serverConfig.port, serverConfig.host);

var io = socketIo.listen(http_serv);
// ioConfig.config(io);

ioHandler.handle(io);	

console.log('running on port -> ' + serverConfig.port);

// ================================================================
