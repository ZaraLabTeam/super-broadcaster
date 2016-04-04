(function(ss, socketConnection) {
	var client,
		recorder,
		context,
		bStream,
		canvas = document.getElementById('audioCanvas'),
		btnStartRec = document.getElementById('start-rec-btn'),
		btnStopRec = document.getElementById('stop-rec-btn'),
		contextSampleRate = 48000, // (new AudioContext()).sampleRate,
		resampleRate = contextSampleRate * 2,
		worker = new Worker('public/js/worker/resampler-worker.js');

	worker.postMessage({
		cmd: "init",
		from: contextSampleRate,
		to: resampleRate
	});

	worker.addEventListener('message', function(e) {

		if (bStream && bStream.writable)
		bStream.write(new ss.Buffer(convertFloat32ToInt16(e.data.buffer)));
	}, false);

	btnStartRec.addEventListener('click', function(evt) {
		evt.preventDefault();

		bStream = ss.createStream();
		ss(socketConnection.socket()).emit('audio-stream', bStream, {sampleRate: resampleRate});
		var hostname = window.location.hostname;
		// client = new BinaryClient('ws://' + hostname + ':8003');
		// client.on('open', function() {
		// 	bStream = client.createStream({
		// 		sampleRate: resampleRate
		// 	});
		// });

		if (context) {
			recorder.connect(context.destination);
			return;
		}

		var session = {
			audio: true,
			video: false
		};

		navigator.getUserMedia(session, function(stream) {
			console.log(stream);

			context = new AudioContext();
			var audioInput = context.createMediaStreamSource(stream);
			var bufferSize = 0; // let implementation decide

			recorder = context.createScriptProcessor(bufferSize, 1, 1);

			recorder.onaudioprocess = onAudio;

			audioInput.connect(recorder);

			recorder.connect(context.destination);

		}, function(e) {
			console.log('Ne bachka!');
		});
	});

	function onAudio(e) {
		var left = e.inputBuffer.getChannelData(0);
		
		worker.postMessage({
			cmd: "resample",
			buffer: left
		});

		drawBuffer(left);
	}

	function convertFloat32ToInt16(buffer) {
		var l = buffer.length;
		var buf = new Int16Array(l);
		while (l--) {
			buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
		}
		return buf.buffer;
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

	btnStopRec.addEventListener('click', function() {
		recorder.disconnect();
		bStream.exit();
		// client.close();
	});
})(window.ss, window.socketConnection);