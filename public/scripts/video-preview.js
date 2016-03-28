(function() {
	var videoPlayer = document.getElementById('player');
	var streamLogging = document.getElementById('stream-logging');

	function logger(msg) {
		streamLogging.innerHTML = msg;
	}

	function video() {
		var mimeCodec = 'video/webm; codecs="vp8, vorbis"';
		console.log('Is supported codec: ', MediaSource.isTypeSupported(mimeCodec));

		var mediaSource = new MediaSource();
		videoPlayer.src = window.URL.createObjectURL(mediaSource);

		mediaSource.addEventListener('sourceopen', function(e) {
			var started = false;
			var buffer = mediaSource.addSourceBuffer(mimeCodec);

			window.socket.on('video', function(data) {
				try {
					buffer.appendBuffer(data);
				}
				catch (err) {
					console.log('Mnogo si barz');
				}
			});
		});

		// mediaSource.addEventListener('sourceopen', function(e) {
		// 	var started = false;
		// 	var buffer = mediaSource.addSourceBuffer(mimeCodec);
		// 	// store the buffers until you're ready for them
		// 	var queue = [];

		// 	buffer.addEventListener('updateend', function() {
		// 		console.log('data');
		// 		if (queue.length) {
		// 			buffer.appendBuffer(queue.shift());
		// 		}
		// 	}, false);

		// 	socket.on('video', function(data) {
		// 		var videoData = new Uint8Array(data);
		// 		queue.push(videoData);

		// 		if (!started) {
		// 			console.log('Starting video');
		// 			started = true;
		// 			setTimeout(function() {
		// 				buffer.appendBuffer(queue.shift());
		// 				videoPlayer.play();
		// 			}, 500);
		// 		}
		// 	});
		// });
	}

	function viewVideo(video, ctx) {
		ctx.drawImage(video, 0, 0, ctx.width, ctx.height);
	}

	window.startVideo = video;
})();