var EventEmitter = require('events').EventEmitter;

function Logger() {}

Logger.prototype = new EventEmitter();

Logger.prototype.log = function(msg) {
	msg = msg + '\n';
	process.stdout.write(msg);
	this.emit('message', msg);
};

Logger.prototype.streamLog = function(msg) {
	process.stdout.write(msg);
	this.emit('stream-log', msg);
};

var singleInstance = new Logger();

module.exports = singleInstance;