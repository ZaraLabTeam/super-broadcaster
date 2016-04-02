// ================ DEPENDENCIES =============================

var EventEmitter = require('events').EventEmitter;
var cpuAverage = require('./cpu').cpuAverage;

var cpuLoggingInterval;
// ================================================================

// ================ IMPLEMENTATION =============================

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

		}, 250);
	}, 500);
};

Logger.prototype.toggleCpuLogging = function toggleCpuLogging() {
	if (cpuLoggingInterval) {
		clearInterval(cpuLoggingInterval);
		cpuLoggingInterval = null;
		this.emit('message', 'Stopped CPU logging');
	} else {
		singleInstance.cpuLog();
		this.emit('message', 'Started CPU logging');
	}
};

var singleInstance = new Logger();

// ================================================================

module.exports = singleInstance;