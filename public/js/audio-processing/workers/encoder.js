//importScripts('libmp3lame.js');
importScripts('../../bower_components/lamejs/lame.all.js');

var mp3encoder;
var lib = new lamejs();

self.onmessage = function(e) {
	var command = e.data.cmd;

	switch (command) {

		case 'init':
			var config = {};

			if (e.data.config) {
				config = e.data.config;
			}

			mp3encoder = new lib.Mp3Encoder(
				config.channels || 2,
				config.samplerate || 44100,
				config.bitrate || 128);

			break;

		case 'encode':
			var lo = e.data.buf;
			var l = new Float32Array(lo.length);

			for (var i = 0; i < lo.length; i++) {
				l[i] = lo[i] * 32767.5;
			}
			var mp3data = mp3encoder.encodeBuffer(l);

			self.postMessage({
				cmd: 'data',
				buf: mp3data
			});

			break;

		case 'finish':
			var mp3data = mp3encoder.flush();

			self.postMessage({
				cmd: 'end',
				buf: mp3data
			});

			mp3encoder = null;
			break;
	}
};