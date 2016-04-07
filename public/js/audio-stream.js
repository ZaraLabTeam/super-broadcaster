(function(ss, socketConnection, Mp3AudioStreamer) {
	var canvas = document.getElementById('audioCanvas'),
		btnStartRec = document.getElementById('start-rec-btn'),
		btnStopRec = document.getElementById('stop-rec-btn'),
		streamer = new Mp3AudioStreamer(ss, {}, onAudio);

	btnStartRec.addEventListener('click', function(evt) {
		evt.preventDefault();
		// socketConnection.emit('broadcast-start');

		//setTimeout(function() {
			streamer.start();
		//}, 500);
	});

	btnStopRec.addEventListener('click', function(evt) {
		evt.preventDefault();
		streamer.stop();
	});

	function onAudio(e) {
		var left = e.inputBuffer.getChannelData(0);
		drawBuffer(left);
	}

	//https://github.com/cwilso/Audio-Buffer-Draw/blob/master/js/audiodisplay.js
	function drawBuffer(data) {
		var width = canvas.width,
			height = canvas.height,
			context = canvas.getContext('2d');

		context.clearRect(0, 0, width, height);
		var step = Math.ceil(data.length / width);
		var amp = height / 2;
		for (var i = 0; i < width; i++) {
			var min = 1.0;
			var max = -1.0;
			for (var j = 0; j < step; j++) {
				var datum = data[(i * step) + j];
				if (datum < min)
					min = datum;
				if (datum > max)
					max = datum;
			}
			context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
		}
	}

})(window.ss, window.socketConnection, window.Mp3AudioStreamer);