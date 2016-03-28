// ================ DEFAULT VALUES ==============================

var VIDEO_IN = "/dev/video0";
var AUDIO_IN = 'hw:0'; // "pulse";
var IN_RES = "640x480";
var OUT_RES = "640x480";
var FPS = 30; // Reduce to free resources
var V_BITRATE = '512k'; // Reduce to free resources
var A_BITRATE = '128k'; // Reduce to free resources
var QSCALE = 8; // QulaityScale? // Increase to free resources // Decrease for better quality
var BUFFER = '512k';
var VCODEC = 'libx264';
var ACODEC = 'libmp3lame';
var FORMAT = 'flv';
var OUTPUT = "rtmp://a.rtmp.youtube.com/live2";
var VERBOSITY = 'verbose'; // 'quiet';  // 'info';

// ==============================================================

// ================ CONFIGURATION MODEL =========================

/**
* Configuration for the broadcast, accepts a configuration object with 
* string or number properties, because these properties will be 
* used on the shell they are sanitazed and an errow is thrown on invalid data
* the error contains the property that failed to be set and the given value
*/
function BroadcastConfiguration(cfg) {
	for (var prop in cfg) {
		var val = cfg[prop];

		if (val && cfg.hasOwnProperty(prop)) {
			this[prop] = val;
		}
	}
}

Object.defineProperties(BroadcastConfiguration.prototype, {
	video: {
		get: function() {
			if (!this._video) {
				return VIDEO_IN;
			}

			return this._video;
		},

		set: function(value) {
			validateString(value, 'video');
			this._video = value;
		},

		configurable: false,
		enumerable: true
	},

	audio: {
		get: function() {
			if (!this._audio) {
				return AUDIO_IN;
			}

			return this._audio;
		},

		set: function(value) {
			validateString(value, 'audio');
			this._audio = value;
		},

		configurable: false,
		enumerable: true
	},

	inRes: {
		get: function() {
			if (!this._inRes) {
				return IN_RES;
			}

			return this._inRes;
		},

		set: function(value) {
			validateResolution(value, 'inRes');
			this._inRes = value;
		},

		configurable: false,
		enumerable: true
	},

	outRes: {
		get: function() {
			if (!this._outRes) {
				return OUT_RES;
			}

			return this._outRes;
		},

		set: function(value) {
			validateResolution(value, 'outRes');
			this._outRes = value;
		},

		configurable: false,
		enumerable: true
	},

	fps: {
		get: function() {
			if (!this._fps) {
				return FPS;
			}

			return this._fps;
		},

		set: function(value) {
			validateFps(value);
			this._fps = value;
		},

		configurable: false,
		enumerable: true
	},

	videoBitrate: {
		get: function() {
			if (!this._videoBitrate) {
				return V_BITRATE;
			}

			return this._videoBitrate;
		},

		set: function(value) {
			validateBytes(value, 'videoBitrate');
			this._videoBitrate = value;
		},

		configurable: false,
		enumerable: true
	},

	audioBitrate: {
		get: function () {
			if (!this._audioBitrate) {
				return A_BITRATE;
			}

			return this._audioBitrate;
		},
	
		set: function (value) {
			validateBytes(value, 'audioBitrate');
			this._audioBitrate = value;
		},
	
		configurable: false,
		enumerable: true
	},

	qscale: {
		get: function () {
			if (!this._qscale) {
				return QSCALE;
			}

			return this._qscale;
		},
	
		set: function (value) {
			validateScale(value);
			this._qscale = value;
		},
	
		configurable: false,
		enumerable: true
	},

	buffer: {
		get: function () {
			if (!this._buffer) {
				return BUFFER;
			}

			return this._buffer;
		},
	
		set: function (value) {
			validateBytes(value, 'buffer');
			this._buffer = value;
		},
	
		configurable: false,
		enumerable: true
	},

	// Output video codec
	vcodec: {
		get: function () {
			if (!this._vcodec) {
				return VCODEC;
			}

			return this._vcodec;
		},
	
		set: function (value) {
			validateString(value, 'vcodec');
			this._vcodec = value;
		},
	
		configurable: false,
		enumerable: true
	},

	// Output audio codec
	acodec: {
		get: function () {
			if (!this._acodec) {
				return ACODEC;
			}

			return this._acodec;
		},
	
		set: function (value) {
			validateString(value, 'acodec');
			this._acodec = value;
		},
	
		configurable: false,
		enumerable: true
	},

	format: {
		get: function () {
			if (!this._format) {
				return FORMAT;
			}

			return this._format;
		},
	
		set: function (value) {
			validateString(value, 'format');
			this._format = value;
		},
	
		configurable: false,
		enumerable: true
	},

	output: {
		get: function() {
			if (!this._output) {
				return OUTPUT;
			}

			return this._output;
		},

		set: function(value) {
			validateString(value, 'output');
			this._output = value;
		},

		configurable: false,
		enumerable: true
	},

	verbosity: {
		get: function () {
			if (!this._verbosity) {
				return VERBOSITY;
			}

			return this._verbosity;
		},
	
		set: function (value) {
			validateString(value);
			this._verbosity = value;
		},
	
		configurable: false,
		enumerable: true
	},

	title: {
		get: function () {
			return this._title;
		},
	
		set: function (value) {
			validateString(value, 'title');
			this._title = value;
		},
	
		configurable: false,
		enumerable: true
	},

	key: {
		get: function() {
			return this._key;
		},

		set: function(value) {
			validateString(value, 'key');
			this._key = value;
		},

		configurable: false,
		enumerable: true
	},
});

BroadcastConfiguration.prototype.toString = function() {
	var result = '\n';

	for (var prop in this) {
		if (prop && prop[0] != '_' && typeof(this[prop]) !== 'function' && prop !== 'key') {
			result += '\t' + prop + ' = ' + this[prop] + '\n';
		}	
	}

	return result;
};

// ==============================================================

// ================ CONFIGURATION PRESETS =======================

function factory(cfg, key) {
	var result = {};

	if (typeof(cfg) === 'string') {

		console.log('Config --> ', cfg);

		validateString(key);
		cfg = cfg.toLowerCase();

		switch (cfg) {
			case 'medium':
			case 'default':
				result = new BroadcastConfiguration();
				break;
			case 'slow':
				result = getSlowConfig();
				break;
			case 'fast':
				result = getFastConfig();
				break;
			default: 
				throw new Error('Invalid configuration word -> ' + cfg);
		}

		result.key = key;
	}
	else {
		result = new BroadcastConfiguration(cfg);
	}

	return result;
}

function getSlowConfig() {
	return new BroadcastConfiguration({
		outRes: '480x240',
		videoBitrate: '128k',
		qscale: 30,
		fps: 16
	});
}

function getFastConfig() {
	return new BroadcastConfiguration({
		outRes: '1280x768',
		videoBitrate: '2000k',
		buffer: '4096k',
		qscale: '3'
	});
}

// ===============================================================

// ================ VALIDATION ===================================

function validateString(str, propName) {
	if (!str || str.indexOf(' ') !== -1) {
		raiseError(str, propName);
	}
}

function validateResolution(resString, propName) {
	validateRegex(resString, /^\d{3,4}x\d{3,4}$/, propName);
}

function validateScale(scale) {
	if (!validateNumberRange(+scale, 1, 32)) {
		raiseError(scale, 'qscale');
	}
}

function validateFps(fpsString) {
	if (!validateNumberRange(+fpsString, 1, 300)) {
		raiseError(fpsString, 'fps');
	}
}

function validateBytes(bytes, propName) {
	validateRegex(bytes, /^\d+[km]+$/, propName);
}

function validateRegex(str, regex, propName) {
	if (!regex.test(str)) {
		raiseError(str, propName);
	}
}

function validateNumberRange(number, bottom, top) {
	if (isNaN(number)) {
		return false;
	}

	return bottom <= number && number <= top;
}

function raiseError(value, propName) {
	throw new Error('Invalid value: "' + value + '" for the property: "' + propName + '".');
}

// ===============================================================

// ================ EXPORTS ======================================

module.exports.factory = factory;

// ===============================================================