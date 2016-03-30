// ================ DEPENDENCIES =============================

var presets = require('./presets');
var logger = require('../logger');

// ================================================================

// ================ IMPLEMENTATION =============================

var activeConfig = presets.default264;

function saveConfig(name, command, output) {
	validateConfig(name, command, output);
	
	presets[name] = {
		"name": name,
		"command": command,
		"output": output || "default"
	};

	logger.log('Config "{{name}}" saved successfully!'.formatPV({name: name}));
}

function setActiveConfig(name) {
	var config = presets[name];
	if (config) {
		activeConfig = config;
		logger.log('Active config set to: "{{name}}"'.formatPV({name: name}));
	} 
	else {
		logger.log(
			'Could not set config to "{{name}}", no configuration by that name, using previous config: "{{prev}}"'
				.formatPV({name: name, prev: activeConfig.name}));
	}
}

function removeConfig(name) {
	var config = presets[name];
	if (config) {
		presets[name] = null;
		logger.log('Removed "{{name}}" from configurations');
	}
	else {
		logger.log('No such config "{{name}}"');
	}
}

function getSavedConfigs() {
	var result = Object.keys(presets);

	return result;
}

function getActiveConfig() {
	return {
		name: activeConfig.name,
		command: activeConfig.command,
		output: activeConfig.output
	};
}

// ================================================================

// ================ VALIDATION ===================================

function validateConfig(name, command, output) {
	if (!name) throw new Error('A configuration must have a name to be uniquely identified!');
	if (!command) throw new Error('A configuration must have a command property!');
}

function validateString(str, propName) {
	if (str !== null && (!str || str.indexOf(' ') !== -1)) {
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
	saveConfig: saveConfig,
	setActiveConfig: setActiveConfig,
	removeConfig: removeConfig,
	getSavedConfigs: getSavedConfigs,
	getActiveConfig: getActiveConfig
};

// ===============================================================