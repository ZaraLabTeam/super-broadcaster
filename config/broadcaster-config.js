// ================ DEFAULT VALUES ==============================

var VIDEO_IN = "/dev/video0";
var AUDIO_IN = "pulse";
var IN_RES = "640x480";
var OUT_RES = "640x360";
var FPS = 30;
var QUAL = 'medium';
var VBR = '1000k';
var OUTPUT = "rtmp://a.rtmp.youtube.com/live2";

// ==============================================================

// ================ CONFIGURATION MODEL =========================

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
			if (!this._output) {
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
			validateFps(value, 'fps');
			this._fps = value;
		},

		configurable: false,
		enumerable: true
	},

	quality: {
		get: function() {
			if (!this._quality) {
				return QUAL;
			}

			return this._quality;
		},

		set: function(value) {
			validateString(value, 'quality');
			this._quality = value;
		},

		configurable: false,
		enumerable: true
	},

	vbr: {
		get: function() {
			if (!this._vbr) {
				return VBR;
			}

			return this._vbr;
		},

		set: function(value) {
			validateVbr(value, 'vbr');
			this._vbr = value;
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

function configure(cfg, key) {
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
		quality: 'slow',
		vbr: '500k',
	});
}

function getFastConfig() {
	return new BroadcastConfiguration({
		inRes: '1280x768',
		outRes: '1280x768',
		quality: 'fast',
		vbr: '2000k'
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

function validateFps(fpsString, propName) {
	validateRegex(fpsString, /^\d{2,3}$/, propName);
}

function validateVbr(vbrString, propName) {
	validateRegex(vbrString, /^\d+[^- ]+$/, propName);
}

function validateRegex(str, regex, propName) {
	if (!regex.test(str)) {
		raiseError(str, propName);
	}
}

function raiseError(value, propName) {
	throw new Error('Invalid value: "' + value + '" for the property: "' + propName + '".');
}

// ===============================================================

// ================ EXPORTS ======================================

module.exports.configure = configure;

// ===============================================================