window.socketConnection = (function() {
	'use strict';

	// ================ INITIALIZATION =============================

	var messageBox = document.getElementById('messages');
	var streamLogging = document.getElementById('stream-logging');
	var cpuLogging = document.getElementById('cpu-log-value');

	var connectedSocket = {};
	var connectionPromise = new Promise(establishConnection);

	// ================================================================

	function establishConnection(resolve) {
		var pass = getPassword();

		var socket = connect('/' + pass);

		socket.on('error', function(err) {
			console.log(err);

			if (err.toString() === 'Invalid namespace') {
				localStorage.setItem('pass', '');
				establishConnection(resolve);
			}
		});

		socket.once('connect', function() {
			printMessage('Connected!', 'good');

			this.on('disconnect', disconnected);

			this.on('message', printMessage);

			this.on('stream-log', printLog);

			this.on('cpu-log', printCpu);

			connectedSocket = this;

			resolve();
		});
	}

	function connect(namesapce) {
		var socket = io.connect(namesapce, {
			'connect timeout': 1000,
			'reconnect': false
		});

		return socket;
	}

	function getPassword() {
		while (!localStorage.getItem('pass')) {
			localStorage.setItem('pass', prompt('Enter the server password to connect!'));
		}

		var localPass = localStorage.getItem('pass');

		return localPass;
	}

	function disconnected() {
		printMessage('Disconnected!', 'bad');
	}

	function printMessage(msg, cssClass) {
		if (!cssClass) {
			cssClass = 'standard';
		}

		msg = msg.replace(RegExp('\n', 'g'), '<br />');

		messageBox.innerHTML += '<p class="' + cssClass + '">' + msg + '</p>\n';
	}

	function printLog(msg) {
		streamLogging.innerHTML = '<p class="good">' + msg + '</p>';
	}

	function printCpu(percent) {
		var cssClass = '';
		if (percent < 40) {
			cssClass = 'good';
		} else if (percent < 75) {
			cssClass = 'warning';
		} else {
			cssClass = 'bad';
		}

		cpuLogging.innerHTML = '<p class="' + cssClass + '">' + percent + '%</p>';
	}

	function clear() {
		messageBox.innerHTML = '';
		streamLogging.innerHTML = '';
	}

	function addEvent() {
		connectedSocket.on.apply(connectedSocket, arguments);
	}

	function emit() {
		connectedSocket.emit.apply(connectedSocket, arguments);
	}

	// ================ EXPORTS =============================
	
	return {
		establishConnection: function() {
			return connectionPromise;
		},

		clearLog: clear,

		on: addEvent,

		emit: emit
	};
	
	// ================================================================
})();