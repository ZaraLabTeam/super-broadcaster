(function(window) {
	'use strict';

	window.InitLogger = function(socket) {

		// UI Elements
		var messageBox = document.getElementById('messages'),
			streamLoggingBox = document.getElementById('stream-logging'),
			cpuLoggingBox = document.getElementById('cpu-log-value'),
			memoryLoggingBox = document.getElementById('ram-log-value'),
			onAirLabel = document.getElementById('on-air'),
			color = 'default';

		socket.on('general-log', printMessage.bind(null, messageBox, false));

		socket.on('stream-log', function(msg, style) {
			printMessage(streamLoggingBox, true, msg, style);
			color = toggleOnAir(onAirLabel, color);
		});

		socket.on('cpu-log', printUsage.bind(null, cpuLoggingBox));

		socket.on('memory-log', printUsage.bind(null, memoryLoggingBox));

		socket.on('disconnect', printMessage.bind(
			null, messageBox, false, 'Disconnected', 'danger'));

		printMessage(messageBox, false, 'Connected', 'success');
	};

	function printMessage(container, replaceContent, msg, style) {
		if (!style) {
			style = 'normal';
		}

		var html = '<pre class="{{cssClass}}"><time class="time">{{time}}</time>  {{msg}}</pre>\n'
			.formatPV({
				cssClass: style,
				msg: msg,
				time: (new Date()).toLocaleTimeString()
			});

		if (replaceContent) {
			container.innerHTML = html;
		} else {
			container.innerHTML += html;
		}

		container.scrollTop = container.scrollHeight;
	}

	function printUsage(container, percent) {
		var cssClass = '';
		if (percent < 44) {
			cssClass = 'success';
		} else if (percent < 75) {
			cssClass = 'warning';
		} else {
			cssClass = 'danger';
		}

		container.innerHTML = '<p class="{{cssClass}}">{{percent}}%</p>'
			.formatPV({
				cssClass: cssClass,
				percent: percent
			});
	}

	function toggleOnAir(label, color) {
		label.className = '';
		
		if (color === 'default') {
			label.style = '';
			color = 'red';
		} else {
			color = 'default';
			label.style = 'color: red';
		}

		return color;
	}

})(window);