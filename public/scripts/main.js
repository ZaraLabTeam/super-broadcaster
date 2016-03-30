(function() {
	'use strict';

	// Todo: auto scroll logger window

	// ================ INITIALIZATION =============================
	polyfills();

	window.socket = establishConnection();

	var messageBox = document.getElementById('messages');
	var streamLogging = document.getElementById('stream-logging');
	var configSelect = document.getElementById('config');
	var toggleable = document.getElementById('toggle');
	var createConfigText = document.getElementById('advanced-config');
	var videoPlayer = document.getElementById('player');

	var btnApplyAdvanced = document.getElementById('apply-advanced');
	var btnStart = document.getElementById('start');
	var btnStop = document.getElementById('stop');
	var btnSetConfig = document.getElementById('set-config');
	var btnSaveConfig = document.getElementById('save-config');
	var btnClear = document.getElementById('clear');

	// ================================================================

	// ================ SOCKET EVENTS =============================

	socket.on('connect', connected);

	socket.on('disconnect', disconnected);

	socket.on('message', printMessage);

	socket.on('stream-log', printLog);

	// ============================================================

	// ================ UI EVENTS =================================

	// On Start
	btnStart.addEventListener('click', function(evt) {
		evt.preventDefault();
		socket.emit('broadcast-start');

		btnStart.disabled = true;
	}, false);

	// On SetConfig
	btnSetConfig.addEventListener('click', function(evt) {
		evt.preventDefault();
		var name = getSelectedConfiguration();

		socket.emit('broadcast-setConfig', name);
	}, false);

	// On SaveConfig
	btnSaveConfig.addEventListener('click', function(evt) {
		evt.preventDefault();
		try {
			var config = JSON.parse(createConfigText.value);
			socket.emit('broadcast-addConfig', config.name, config.command, config.output);
		} catch (err) {
			alert('Error with parsing the config to Json format');
		}
	});

	// On Stop
	btnStop.addEventListener('click', function(evt) {
		evt.preventDefault();
		socket.emit('broadcast-stop');

		btnStart.disabled = false;
	}, false);

	// On Config Select
	configSelect.addEventListener('change', function() {
		var selected = this.value;
		if (selected === 'create') {
			changeCssClass(toggleable, '');
		} else {
			changeCssClass(toggleable, 'hidden');
		}

	}, false);

	// On Clear
	btnClear.addEventListener('click', function(evt) {
		evt.preventDefault();
		messageBox.innerHTML = '';
		streamLogging.innerHTML = '';
	}, false);

	// ============================================================

	// ================ HELPERS ===================================

	function setupSelectMenu() {
		socket.emit('broadcast-getConfigs', function(configs) {
			var docFragment = document.createDocumentFragment();

			console.log(configs);

			configs.forEach(function(item) {
				var option = document.createElement('option');
				option.value = item;
				option.innerText = item;
				docFragment.appendChild(option);
			});

			configSelect.appendChild(docFragment);
		});
	}

	function getActiveConfig() {
		socket.emit('broadcast-getActiveConfig', function(data) {
			createConfigText.value = JSON.stringify(data, null, '\t');
		});
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

	function changeCssClass(element, cls) {
		element.className = cls;
	}

	function connected() {
		printMessage('Connected!', 'good');
		setupSelectMenu();
		getActiveConfig();
	}

	function disconnected() {
		printMessage('Disconnected!', 'bad');
	}

	function getSelectedConfiguration() {
		var selected = configSelect.value;

		if (selected === 'advanced') {
			return "default";
		} else {
			return selected;
		}
	}

	function getPassword() {
		while (!localStorage.getItem('pass')) {
			localStorage.setItem('pass', prompt('Enter the server password to connect!'));
		}

		var localPass = localStorage.getItem('pass');

		return localPass;
	}

	function establishConnection() {
		var pass = getPassword();
		var socket;

		// Todo: fix - this logic is invalid
		try {
			console.log(pass);
			socket = io.connect('/' + pass, {
				'connect timeout': 3000,
				'reconnect': false
			});
		} catch (err) {
			console.log(err);
			localStorage.setItem('pass', '');
			socket = establishConnection();
		}

		console.log(socket);
		return socket;
	}

	// ================================================================

	// ================ POLYFILLS =============================

	function polyfills() {
		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
		})();

		window.navigator.getWebcam = (function() {
			return window.navigator.getUserMedia ||
				window.navigator.webkitGetUserMedia ||
				window.navigator.mozGetUserMedia ||
				window.navigator.msGetUserMedia;
		})();

		window.URL = (function() {
			return window.URL || window.webkitURL;
		})();

		window.MediaSource = (function() {
			return window.MediaSource || window.WebKitMediaSource;
		})();
	}

	// ================================================================	
})();