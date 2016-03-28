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
	var advancedConfig = document.getElementById('advanced-config');
	var videoPlayer = document.getElementById('player');

	var btnApplyAdvanced = document.getElementById('apply-advanced');
	var btnStart = document.getElementById('start');
	var btnStop = document.getElementById('stop');
	var btnTest = document.getElementById('test');
	var btnClear = document.getElementById('clear');

	advancedConfig.value = getAdvancedConfigInitialValue();

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
		var config = getSelectedConfiguration();
		socket.emit('broadcast-start', config);

		btnStart.disabled = true;
	}, false);

	// On Test
	btnTest.addEventListener('click', function(evt) {
		evt.preventDefault();
		var config = getSelectedConfiguration();
		socket.emit('broadcast-test', config);
		window.startVideo();

		btnTest.disabled = true;
		changeCssClass(videoPlayer, '');

	}, false);

	// On Stop
	btnStop.addEventListener('click', function(evt) {
		evt.preventDefault();
		socket.emit('broadcast-stop');

		btnTest.disabled = false;
		btnStart.disabled = false;
		videoPlayer.src = '';
		changeCssClass(videoPlayer, 'hidden');
	}, false);

	// On Config Select
	configSelect.addEventListener('change', function() {
		var selected = this.value;
		if (selected === 'advanced') {
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
	}

	function disconnected() {
		printMessage('Disconnected!', 'bad');
	}

	function getSelectedConfiguration() {
		var selected = configSelect.value;
		if (selected === 'advanced') {
			// Store config to ls before using it
			window.localStorage.setItem('advancedConfig', advancedConfig.value);
			return JSON.parse(advancedConfig.value);
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

	function getAdvancedConfigInitialValue() {
		var value = window.localStorage.getItem('advancedConfig');

		if (!value) {
			value = JSON.stringify({
				// "key": "Please add your key",
				"inRes": "640x420",
				"video": "/dev/video0",
				"fps": 30,
				"audio": "hw:0",
				"vcodec": "libx264",
				"outRes": "640x360",
				"videoBitrate": "512k",
				"acodec": "libmp3lame",
				"qscale": 8,
				"audioBitrate": "512k",
				"buffer": "512k",
				"title": "Zaralab Live",
				"verbosity": "verbose",
				"format": "flv",
				"output": "rtmp://a.rtmp.youtube.com/live2"
			}, null, '\t');

			window.localStorage.setItem('advancedConfig', value);
		}

		return value;
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