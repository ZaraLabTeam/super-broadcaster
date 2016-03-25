// ================ DEPENDENCIES ================================

var terminate = require('terminate');
var exec = require('child_process').exec;

// The child proccess object will be stored here
var child = null;

var SCRIPT_FORMAT =
	'avconv ' +
	'-f video4linux2 -s {{inRes}} -i {{video}} -filter:v yadif -r {{fps}} -g $(({{fps}} * 2)) -b:v {{vbr}} ' +
	'-f alsa -ac 2 -i {{audio}} ' +
	'-vcodec libx264 -s {{outRes}} -preset {{quality}} ' +
	'-acodec libmp3lame -ar 44100 -threads 4 -qscale 8 -b:a 712000 -bufsize 512k ' +
	'-f flv "{{output}}/{{key}}"';

// ==============================================================

/**
 * Fires up a video stream from the shell with custom configuration
 */
function broadcast(config) {

	validateConfig(config);

	var script = formatString(SCRIPT_FORMAT, config);

	child = exec(script);

	child.stdout.on('data', function(data) {
		console.log(data); // process output will be displayed here
	});
	child.stderr.on('data', function(data) {
		console.log(data); // process error output will be displayed here
	});

	child.on('exit', function (code) {
		console.log('child exit...');
	});
}

function stop() {
	if (child) {
		console.log('stop!');
		terminate(child.pid);
		child = null;
	}
}

function validateConfig(config) {
	if (!config) {
		throw new Error('Configuration is not initialized');
	}

	for (var prop in config) {
		if (!config[prop]) {
			throw {
				message: prop + ' is not set correctly -> got ' + config[prop],
				property: prop,
				value: value
			};
		}
	}
}

function isRunning() {
	if (child) {
		return true;
	}

	return false;
}

// ================ EXPORTS =====================================

module.exports.broadcast = broadcast;
module.exports.stop = stop;
module.exports.isRunning = isRunning;

// ==============================================================

// ================ HELPERS =====================================

function formatString(str, args) {
	if (!args) return str;

	for (var arg in args) {
		str = str.replace(
			RegExp("\\{\\{" + arg + "\\}\\}", "gi"), args[arg]);
	}

	return str;
}

// ==============================================================