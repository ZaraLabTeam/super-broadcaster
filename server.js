// ================ DEPENDENCIES ================================

// Configs
require('./config/extension-methods');
var serverConfig = require('./config/server-config');
var ioConfig = require('./config/io-config');

// NPM modules
var https = require('https');
var socketIo = require('socket.io');

// Project modules
var httpHandler = require('./http/httpHandler');
var ioHandler = require('./socket/ioHandler');
var logger = require('./logging/logger');
// require('./socket/socket-server');

// ==============================================================

// ================ IMPLEMENTATION ==============================

var httpsServer = https.createServer(serverConfig.options, httpHandler.handle)
	.listen(serverConfig.httpPort); // .listen(serverConfig.port, serverConfig.host);

var io = socketIo.listen(httpsServer);
// ioConfig.config(io);

ioHandler.handle(io);	

console.log('running on port -> {{port}}'.formatPV({port: serverConfig.httpPort}));

// ================================================================
