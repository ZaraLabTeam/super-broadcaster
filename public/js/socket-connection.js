window.socketConnection = (function() {
	'use strict';

	// ================ INITIALIZATION =============================

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
			console.log('Connected');

			this.on('disconnect', function() {
				console.log('disconnected');
			});

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

	function getSocket() {
		return connectedSocket;
	}

	// ================ EXPORTS =============================
	
	return {
		establishConnection: function() {
			return connectionPromise;
		},

		clearLog: clear,

		on: addEvent,

		emit: emit,

		socket: getSocket
	};
	
	// ================================================================
})();