(function() {
	'use strict';

	// ================ INITIALIZATION =============================
	
	var socket = io.connect('/', {
		'connect timeout': 3000,
		'reconnect': false
	});

	var messageBox = document.getElementById('messages');
	var configSelect = document.getElementById('config');
	var toggleable = document.getElementById('toggle');
	var advancedConfig = document.getElementById('advanced-config');

	var applyAdvancedBtn = document.getElementById('apply-advanced');
	var startBtn = document.getElementById('start');
	var stopBtn = document.getElementById('stop');

	advancedConfig.value = JSON.stringify({
		"key": "Please add your key",
		"video": "/dev/video0",
		"audio": "pulse",
		"inRes": "640x420",
		"outRes": "640x360",
		"fps": 30,
		"quality": "medium",
		"vbr": "1000k",
		"output": "rtmp://a.rtmp.youtube.com/live2"
	}, null, '\t');

	// ================================================================

	// ================ SOCKET EVENTS =============================

	socket.on('connect', connected);

	socket.on('disconnect', disconnected);

	socket.on('message', printMessage);

	// ============================================================

	// ================ UI EVENTS =================================

	// On Start
	startBtn.addEventListener('click', function(evt) {
		evt.preventDefault();
		socket.emit('broadcast-start');
		printMessage('Starting broadcast...', 'good');
	}, false);

	// On Stop
	stopBtn.addEventListener('click', function(evt) {
		evt.preventDefault();
		socket.emit('broadcast-stop');
		printMessage('Stopping broadcast...', 'bad');
	}, false);

	// On Config Select
	configSelect.addEventListener('change', function() {
		var selected = this.value;
		if (selected === 'advanced') {
			toggleClass(toggleable, '');
		} else {
			toggleClass(toggleable, 'hidden');
			socket.emit('broadcast-config', selected);
			console.log('config changed!');
		}

	}, false);

	// On Advanced Config
	applyAdvancedBtn.addEventListener('click', function(evt) {
		evt.preventDefault();
		var config = JSON.parse(advancedConfig.value);
		console.log(config);

		socket.emit('broadcast-config', config);
		console.log('config changed!');

	}, false);

	// ============================================================

	// ================ HELPERS ===================================

	function printMessage(msg, cssClass) {
		if (!cssClass) {
			cssClass = 'standard';
		}

		msg = msg.replace('\n', '<br />');

		messageBox.innerHTML += '<p class="' + cssClass + '">' + msg + '</p>\n';
	}

	function toggleClass(element, cls) {
		element.className = cls;
	}

	function connected() {
		printMessage('Connected!', 'good');
	}

	function disconnected() {
		printMessage('Disconnected!', 'bad');
	}

	// ================================================================
})();