// ================ DEPENDENCIES ================================

// NPM Dependencies
var terminate = require('terminate');
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;

// Project modules
var presetsManager = require('./presets/presets-manager');
var logger = require('./logging/logger');
var secret = require('./secret');

// The stream process objects will be stored here
var broadcastStream = null;
var processes = [];

// emits the broadcast started event with the stream
var ev = new EventEmitter();

// ==============================================================

// Constants
var BROADCAST_STARTED_MSG = '============ Broadcast Started ============';
var BROADCAST_ENDED_MSG = '============ Broadcast Ended ============';
var BROADCAST_ABORTED_MSG = '============ Broadcast Aborted ============';
var CONFIGURATION_MSG = '============ Configuration ============ \n';

/**
 * Fires up a video stream from the shell with the last set configutation
 */
function broadcast() {
	var commands = prepareForBroadcast();

	startCommands(commands);

	logStreamData(broadcastStream);

	ev.emit('broadcast-started', broadcastStream.stdout);
	logger.log(BROADCAST_STARTED_MSG, 'success');
}

function stopPreviousBroadcast() {
	var prevProc = null;

	// Unpipe Streams
	processes.forEach(function(prc) {
		if (prevProc) {
			prevProc.stdout.unpipe(prc.stdin);
		}

		prevProc = prc;
	});

	// Terminate Processes
	processes.forEach(function(prc) {
		prc.kill();
	});

	// var i = processes.length;
	// while (i--) {
	// 	var prc = processes[i];
	// 	terminate(prc.pid, handleTermination);
	// }

	if (broadcastStream) {
		logger.log(BROADCAST_ENDED_MSG, 'danger');
	}

	processes = [];
	broadcastStream = null;
}

function handleTermination(err) {
	if (err) {
		logger.log('Terminate Proccess Error!', 'danger');
	}
}

function prepareForBroadcast() {
	var broadcastConfig = presetsManager.getActivePreset();

	var data = broadcastConfig.command.split('|');
	var commands = [];

	data.forEach(function(element) {
		var args = element.split(' ').cleanPV('');
		commands.push({
			command: args[0],
			params: args.slice(1)
		});
	});

	if (broadcastConfig.output) {
		setOutput(broadcastConfig.output, commands[commands.length - 1]);
	}

	var message =
		'{{configMsg}} Preset: {{preset}} \n Command: {{command}} \n {{configMsg}}'
		.formatPV({
			configMsg: CONFIGURATION_MSG,
			preset: broadcastConfig.name,
			command: broadcastConfig.command
		});

	logger.log(message, 'warning');
	stopPreviousBroadcast();

	return commands;
}

function setOutput(output, command) {
	if (output === 'test') {
			output = 'recordings/test-{{now}}'
				.formatPV({now: (new Date()).getTime()});
		}

		command.params.push(output);
}

function isRunning() {
	if (broadcastStream) {
		return true;
	}

	return false;
}

function startCommands(commands) {
	commands.forEach(function(cmd) {
		logger.log(
			'Running command: "{{command}}" with args: "{{params}}"'
			.formatPV(cmd));

		var child = spawn(cmd.command, cmd.params);
		processes.push(child);

		child.on('error', function(err) {
			logger.log('Child Process Failed: \n {{err}}'.formatPV({
				err: err.toString()
			}), 'danger');
		});
	});

	var prevProc = null;

	processes.forEach(function(prc) {
		if (prevProc) {
			prevProc.stdout.pipe(prc.stdin);

			prevProc.stdout.on('error', function(err) {
				logger.log('Child stdout Error: {{err}}'.formatPV({
					err: err.toString()
				}), 'danger');
			});
		}

		prc.stdin.on('error', function(err) {
			logger.log('Child stdin Error: {{err}}'.formatPV({
				err: err.toString()
			}), 'error');
		});

		prevProc = prc;
	});

	broadcastStream = processes[processes.length - 1];

	logger.log('Spawned Processes: ' + processes.length, 'warning');
}

// ================ EXPORTS =====================================

module.exports = {
	broadcast: broadcast,
	stop: stopPreviousBroadcast,
	isRunning: isRunning,
	event: ev
};

// ==============================================================

// ================ HELPERS =====================================

function logStreamData(childProcess) {

	// childProcess.on('error', function(err) {
	// 	logger.log(err.toString());

	// 	stopPreviousBroadcast();
	// });

	// ffmpeg or avconv outputs stream information to stderr
	// Log the general information to the main log
	// then logging is handled by another log monitor (for bitrate, fps and etc.)
	var logToGeneral = function(data) {
		if (data.indexOf('frame') === 0) {
			logger.log('Swiching logging to broadcast mode', 'warning');
			childProcess.stderr.removeListener('data', logToGeneral);
			childProcess.stderr.on('data', function(data) {
				logger.broadcastLog(data);
			});

			return;
		}

		logger.log(data);
	};


	childProcess.stderr.setEncoding('utf8');
	childProcess.stderr.on('data', logToGeneral);

	// Todo: parameters check
	childProcess.once('exit', function(exitCode, signal) {

		logger.log('...broadcast received exit call', 'warning');
	});
}

// ==============================================================