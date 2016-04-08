(function(window) {

	var WORKER_PATH = 'public/js/audio-processing/workers/encoder.js';

	function Mp3AudioStreamer(ss, cfg, onAudioCallback) {
		this.stream = null;
		this.bStream = null;
		this.recording = false;
		this.encoder = null;
		this.ws = null;
		this.input = null;
		this.node = null;
		this.samplerate = (new AudioContext()).sampleRate; // 44100; // 22050;
		this.samplerates = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];
		this.channels = 1;
		this.bitrate = 128;// 64;
		this.bitrates = [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 192, 224, 256, 320];
		this.onAudio = onAudioCallback;
	}

	Mp3AudioStreamer.prototype.start = function() {
		if (this.recording)
			return;

		var self = this;

		console.log('start recording');
		this.encoder = new Worker(WORKER_PATH);

		console.log(
			['initializing encoder with samplerate = ',
				this.samplerate,
				' and bitrate = ',
				this.bitrate
			].join(''));

		this.encoder.postMessage({
			cmd: 'init',
			config: {
				channels: self.channels,
				samplerate: self.samplerate,
				bitrate: self.bitrate
			}
		});

		this.encoder.onmessage = function(e) {
			if (self.bStream && self.bStream.writable)
				self.bStream.write(new ss.Buffer(e.data.buf));

			if (e.data.cmd == 'end') {
				// self.ws.close();
				// self.ws = null;
				self.encoder.terminate();
				self.encoder = null;
			}
		};

		window.navigator.getUserMedia({
			video: false,
			audio: true
		}, self.gotUserMedia.bind(self), self.userMediaFailed);
	};

	Mp3AudioStreamer.prototype.userMediaFailed = function(code) {
		alert('grabbing microphone failed: ' + code);
	};

	Mp3AudioStreamer.prototype.gotUserMedia = function(localMediaStream) {
		var self = this;
		this.recording = true;

		console.log('success grabbing microphone');
		this.stream = localMediaStream;

		this.bStream = ss.createStream();
		ss(socketConnection.socket()).emit('audio-stream', this.bStream, {
			sampleRate: this.samplerate
		});

		var audio_context = new window.AudioContext();

		this.input = audio_context.createMediaStreamSource(this.stream);
		this.node = this.input.context.createScriptProcessor(4096, 1, 1);

		console.log('sampleRate: ' + this.input.context.sampleRate);

		this.node.onaudioprocess = function(e) {
			if (!self.recording)
				return;

			if (self.onAudio) {
				self.onAudio(e);
			}

			var channelLeft = e.inputBuffer.getChannelData(0);
			self.encoder.postMessage({
				cmd: 'encode',
				buf: channelLeft
			});
		};

		this.input.connect(this.node);
		this.node.connect(audio_context.destination);
	};

	Mp3AudioStreamer.prototype.stop = function() {
		if (!this.recording) {
			return;
		}

		console.log('stop recording');

		this.stream.stop();
		this.recording = false;

		this.encoder.postMessage({
			cmd: 'finish'
		});

		this.input.disconnect();
		this.node.disconnect();
		this.input = this.node = null;
	};

	window.Mp3AudioStreamer = Mp3AudioStreamer;

})(window);