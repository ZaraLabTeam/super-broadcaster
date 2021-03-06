// ================ DEPENDENCIES =============================

// NPM Modules
var memwatch = require('memwatch-next');
var chalk = require('chalk');
var os = require('os');
var EventEmitter = require('events').EventEmitter;

// Project Modules
var cpuAverage = require('./cpu').cpuAverage;

// Constants
var CPU_POLL_INTREVAL = 1000;
var RAM_POLL_INTERVAL = 1000 * 5;

var styles = {
	danger: chalk.bold.red,
	success: chalk.green,
	normal: chalk.white,
	warning: chalk.italic.yellow
};

// ================================================================

// ================ IMPLEMENTATION =============================

function Logger() {}

Logger.prototype = new EventEmitter();

Logger.prototype.log = function(msg, style) {
	if (!styles[style]) {
		style = 'normal';
	}

	process.stdout.write(styles[style](msg + '\n'));

	this.emit('general-log', msg, style);
};

Logger.prototype.broadcastLog = function(msg) {
	this.emit('stream-log', msg);
};

Logger.prototype.logCpuUsage = function() {
	var self = this;
	this.stopCpuLog();

	this.cpuLoggingInterval = setInterval(function() {

		//Grab first CPU Measure
		var startMeasure = cpuAverage();

		//Set delay for second Measure
		setTimeout(function() {

			//Grab second Measure
			var endMeasure = cpuAverage();

			//Calculate the difference in idle and total time between the measures
			var idleDifference = endMeasure.idle - startMeasure.idle;
			var totalDifference = endMeasure.total - startMeasure.total;

			//Calculate the average percentage CPU usage
			var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

			//Output result 
			self.emit('cpu-log', percentageCPU);

		}, CPU_POLL_INTREVAL / 2);
	}, CPU_POLL_INTREVAL);
};

Logger.prototype.stopCpuLog = function() {
	if (this.cpuLoggingInterval) {
		clearInterval(this.cpuLoggingInterval);
		this.cpuLoggingInterval = null;
		this.log('Stopped CPU logging', 'warning');
	}
};

Logger.prototype.logMemoryUsage = function() {
	var self = this;
	this.stopMemoryLog();

	this.memoryLogInterval = setInterval(function() {
		var data = pollMemoryUsage();
		self.emit('memory-log', data);

	}, RAM_POLL_INTERVAL);
};

Logger.prototype.stopMemoryLog = function() {
	if (this.memoryLogInterval) {
		clearInterval(this.memoryLogInterval);
		this.memoryLogInterval = null;
		this.log('Stopped Meomory logging', 'warning');
	}
};

Logger.prototype.logServerAddress = function(protocol, port) {
	var self = this;
	var ifaces = os.networkInterfaces();

	Object.keys(ifaces).forEach(function(ifname) {
		var alias = 0;

		ifaces[ifname].forEach(function(iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}

			var addr = '{{protocol}}://{{address}}:{{port}}'
				.formatPV({
					protocol: protocol,
					address: iface.address,
					port: port
				});

			if (alias >= 1) {
				// this single interface has multiple ipv4 addresses
				msg = 'Or maybe on: {{addr}}';
			} else {
				// this interface has only one ipv4 adress
				msg = 'Running on: {{addr}}';
			}

			self.log(msg.formatPV({
				addr: addr
			}), 'danger');

			alias++;
		});
	});
};

var singleInstance = new Logger();

singleInstance.logMemoryUsage();
singleInstance.logCpuUsage();

memwatch.on('leak', function(info) {
	singleInstance.log('################## MEMWATCH LEAK ###################', 'warning');
	singleInstance.log('Start: {{start}}'.formatPV(info));
	singleInstance.log('End: {{end}}'.formatPV(info));
	singleInstance.log('Growth: {{growth}}'.formatPV(info));
	singleInstance.log('Reason: {{reason}}'.formatPV(info));
	singleInstance.log('####################################################', 'warning');
});

memwatch.on('stats', function(stats) {
	singleInstance.log('################## MEMWATCH STATS ##################', 'warning');
	singleInstance.log('Estimated Base: {{estimated_base}}'.formatPV(stats));
	singleInstance.log('Current Base: {{current_base}}'.formatPV(stats));
	singleInstance.log('Min: {{min}}'.formatPV(stats));
	singleInstance.log('Max: {{max}}'.formatPV(stats));
	singleInstance.log('Usage trend: {{usage_trend}}'.formatPV(stats));
	singleInstance.log('####################################################', 'warning');
});

// ================================================================

// ================ HELPERS =============================

function pollMemoryUsage() {
	var total = os.totalmem(),
		usage = total - os.freemem(),
		percentage = usage / total * 100;

	return percentage.toFixed(2);
}

// ================================================================

module.exports = singleInstance;