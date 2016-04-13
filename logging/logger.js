// ================ DEPENDENCIES =============================

// NPM Modules
var memwatch = require('memwatch-next');
var os = require('os');
var EventEmitter = require('events').EventEmitter;

// Project Modules
var cpuAverage = require('./cpu').cpuAverage;

// Constants
var CPU_POLL_INTREVAL = 1000;
var RAM_POLL_INTERVAL = 1000 * 5;

// ================================================================

// ================ IMPLEMENTATION =============================
// Timeout intervals
var cpuLoggingInterval;
var memoryLogInterval;

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

Logger.prototype.cpuLog = function() {
	var self = this;

	cpuLoggingInterval = setInterval(function() {

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

Logger.prototype.toggleCpuLogging = function () {
	if (cpuLoggingInterval) {
		clearInterval(cpuLoggingInterval);
		cpuLoggingInterval = null;
		this.emit('message', 'Stopped CPU logging');
	} else {
		singleInstance.cpuLog();
		this.emit('message', 'Started CPU logging');
	}
};

Logger.prototype.logMemoryUsage = function () {
	var self = this;
	this.stopMemoryLog();

	memoryLogInterval = setInterval(function () {
		var data = pollMemoryUsage();
		var msg = 
			'Memory Usage: {{prc}}% \n'
			.formatPV({prc: data});

		process.stdout.write(msg);
		self.emit('memory-log', msg);

	}, RAM_POLL_INTERVAL);
};

Logger.prototype.stopMemoryLog = function() {
	if (memoryLogInterval) {
		clearInterval(memoryLogInterval);
		memoryLogInterval = null;
	}
};

var singleInstance = new Logger();

singleInstance.logMemoryUsage();

memwatch.on('leak', function(info) {
	singleInstance.log('################## MEMWATCH LEAK ###################');
	singleInstance.log('Start: {{start}}'.formatPV(info));
	singleInstance.log('End: {{end}}'.formatPV(info));
	singleInstance.log('Growth: {{growth}}'.formatPV(info));
	singleInstance.log('Reason: {{reason}}'.formatPV(info));
	singleInstance.log('####################################################');
});

memwatch.on('stats', function(stats) {
	singleInstance.log('################## MEMWATCH STATS ##################');
	singleInstance.log('Estimated Base: {{estimated_base}}'.formatPV(stats));
	singleInstance.log('Current Base: {{current_base}}'.formatPV(stats));
	singleInstance.log('Min: {{min}}'.formatPV(stats));
	singleInstance.log('Max: {{max}}'.formatPV(stats));
	singleInstance.log('Usage trend: {{usage_trend}}'.formatPV(stats));
	singleInstance.log('####################################################');
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