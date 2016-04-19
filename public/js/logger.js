(function(window) {
	'use strict';

	window.InitLogger = function(socket) {

		// UI Elements
		var messageBox = document.getElementById('messages'),
			streamLoggingBox = document.getElementById('stream-logging'),
			cpuLoggingBox = document.getElementById('cpu-log-value'),
			memoryLoggingBox = document.getElementById('ram-log-value');

		// Logging Streams
		var generalLog = null,
			broadcastLog = null;

		socket.on('general-log', printMessage.bind(null, messageBox, false));

		socket.on('stream-log', printMessage.bind(null, streamLoggingBox, true));

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
})(window);