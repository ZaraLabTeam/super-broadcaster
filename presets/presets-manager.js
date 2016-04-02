// ================ DEPENDENCIES =============================

var fs = require('fs');
var presets = require('./presets');
var logger = require('../logger');

// ================================================================

// ================ IMPLEMENTATION =============================

var PRESETS_PATH = __dirname + '/presets.json';
var activeConfig = presets.default264;

function savePreset(name, command, output, callback) {
	try {
		validateConfig(name, command, output);
	} catch (err) {
		logger.log(err.toString());
		return;
	}

	presets[name] = {
		"name": name,
		"command": command,
		"output": output || "default"
	};

	var stringifiedPresets = JSON.stringify(presets, null, '\t');

	fs.writeFile(PRESETS_PATH, stringifiedPresets, null, function(err) {
		if (err) {
			logger.log('Error saving "{{name}}" preset'.formatPV({
				name: name
			}));
			return callback(err);
		}

		logger.log('Config "{{name}}" saved successfully!'.formatPV({
			name: name
		}));

		setActivePreset(name);

		if (callback) {
			callback(null, name);
		}
	});
}

function setActivePreset(name) {
	var config = presets[name];
	if (config) {
		activeConfig = config;
		logger.log('Active config set to: "{{name}}"'.formatPV({
			name: name
		}));
	} else {
		logger.log(
			'Could not set config to "{{name}}", no configuration by that name, using previous config: "{{prev}}"'
			.formatPV({
				name: name,
				prev: activeConfig.name
			}));
	}
}

function removePreset(name, callback) {
	var config = presets[name];
	var message = '';

	if (config) {
		delete presets[name];
		var stringifiedPresets = JSON.stringify(presets, null, '\t');

		fs.writeFile(PRESETS_PATH, stringifiedPresets, null, function(err) {
			if (err) {
				message = 'Failed to remove {{name}} from presets'.formatPV({ name: name });

				logger.log(err.toString());
				return callback(message);
			}

			logger.log('Removed "{{name}}" from configurations'.formatPV({name: name}));

			if (callback) {
				callback(null, name);
			}
		});
	} else {
		message = 'No such config "{{name}}"'.formatPV({name: name});
		logger.log(message);
		callback(message);
	}
}

function getSavedPresets() {
	var result = Object.keys(presets);

	return result;
}

function getActivePreset() {
	return {
		name: activeConfig.name,
		command: activeConfig.command,
		output: activeConfig.output
	};
}

function getPreset(name) {
	var preset = presets[name];
	if (preset) {
		return {
			name: preset.name,
			command: preset.command,
			output: preset.output
		};
	} else {
		return null;
	}
}

// ================================================================

// ================ VALIDATION ===================================

function validateConfig(name, command, output) {
	if (!name) throw new Error('A configuration must have a name to be uniquely identified!');
	if (!command) throw new Error('A configuration must have a command property!');

	sanitizeContent(command);
	sanitizeContent(output);
}

// Todo: method body
function sanitizeContent(command) {

}

function validateString(str, propName) {
	if (!str || str.indexOf(' ') !== -1) {
		raiseError(str, propName);
	}
}

function validateResolution(resString, propName) {
	validateRegex(resString, /^\d{3,4}x\d{3,4}$/, propName);
}

function validateQuality(scale) {
	if (!validateNumberRange(+scale, 0, 51)) {
		raiseError(scale, 'crf');
	}
}

function validateFps(fpsString) {
	if (!validateNumberRange(+fpsString, 1, 300)) {
		raiseError(fpsString, 'fps');
	}
}

function validateBytes(bytes, propName) {
	if (isNaN(+bytes)) {
		raiseError(bytes, propName);
	}
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

module.exports = {
	savePreset: savePreset,
	setActivePreset: setActivePreset,
	removePreset: removePreset,
	getSavedPresets: getSavedPresets,
	getActivePreset: getActivePreset,
	getPreset: getPreset
};

// ===============================================================