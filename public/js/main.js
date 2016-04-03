(function(socket) {
	'use strict';

	// Todo: auto scroll logger window

	// ================ INITIALIZATION =============================

	var DEFAULT_CONFIG_NAME = 'default264';

	polyfills();
	socket.establishConnection()
		.then(setupSelectMenu)
		.then(setPresetData)
		.catch(function(err) {
			console.log(err);
			console.log(socket);
		});

	var configSelect = document.getElementById('config');
	var toggleable = document.getElementById('toggle');
	var presetDataText = document.getElementById('preset-data');
	var videoPlayer = document.getElementById('player');
	var cpuLog = document.getElementById('cpu-log');

	var btnBlock = document.getElementsByClassName('btn-block')[0];
	var btnStart = document.getElementById('start');
	var btnStop = document.getElementById('stop');
	var btnSetConfig = document.getElementById('set-config');
	var btnDeleteConfig = document.getElementById('delete-config');
	var btnSaveConfig = document.getElementById('save-config');
	var btnClear = document.getElementById('clear');
	var cbCpuLog = document.getElementById('toggle-cpu-log');

	// ================================================================

	// ================ UI EVENTS =================================

	btnBlock.addEventListener('click', function(evt) {
		evt.preventDefault();
		var target = evt.target;

		if (target === btnStart) {
			start();
		} else if (target === btnStop) {
			stop();
		} else if (target === btnSetConfig) {
			setConfig();
		} else if (target === btnSaveConfig) {
			save();
		} else if (target === btnDeleteConfig) {
			destroy();
		} else if (target === btnClear) {
			clear();
		} else {
			console.log('Else');
		}

	}, false);

	// On Config Select
	configSelect.addEventListener('change', function() {
		setPresetData();
	}, false);

	// On Cpu Log Check
	cbCpuLog.addEventListener('click', toggleCpuLogging, false);

	// On Start
	function start() {
		socket.emit('broadcast-start');
		btnStart.disabled = true;
	}

	// On Stop
	function stop() {
		socket.emit('broadcast-stop');
		btnStart.disabled = false;
	}

	// On SetConfig
	function setConfig() {
		var name = getSelectedPreset();
		socket.emit('broadcast-setConfig', name);
	}

	// On SaveConfig
	function save() {
		try {
			var config = JSON.parse(presetDataText.value);
			socket.emit('preset-add', config.name, config.command, config.output, function(err, name) {
				if (err) {
					alert(err.toString());
					return;
				}

				addOption(name, configSelect);
				configSelect.selectedIndex = configSelect.options.length - 1;
			});
		} catch (err) {
			alert('Error with parsing the config to Json format');
		}
	}

	// On Delete
	function destroy() {
		var selectedConfig = getSelectedPreset();

		if (selectedConfig === DEFAULT_CONFIG_NAME) {
			alert('You cannot delete the default config');
			return;
		}

		var remove = confirm('Delete "' + selectedConfig + '" preset ?');

		if (remove) {
			socket.emit('preset-remove', selectedConfig, function(err, name) {
				if (err) {
					alert(err);
					return;
				}

				var toBeDeleted = configSelect.querySelector('option[value="' + name + '"]');
				configSelect.removeChild(toBeDeleted);

				setPresetData();
			});
		}
	}

	// On Clear
	function clear() {
		window.socketConnection.clearLog();
	}

	// On Cpu Log
	function toggleCpuLogging() {
		socket.emit('log-cpu');

		if (cbCpuLog.checked) {
			changeCssClass(cpuLog, '');	
		} else {
			changeCssClass(cpuLog, 'hidden');
		}
	}

	// ============================================================

	// ================ HELPERS ===================================

	function setupSelectMenu() {
		console.log('setup Menu');
		var promise = new Promise(function(resolve, reject) {

			socket.emit('broadcast-getConfigs', function(configs) {
				var docFragment = document.createDocumentFragment();

				console.log(configs);

				configs.forEach(function(item) {
					addOption(item, docFragment);
				});

				configSelect.appendChild(docFragment);

				resolve();
			});
		});

		return promise;
	}

	function addOption(name, parentElement) {
		var option = document.createElement('option');
		option.innerText = name;
		option.value = name;

		parentElement.appendChild(option);

		return option;
	}

	function getSelectedPreset() {
		return configSelect.value;
	}

	function changeCssClass(element, cls) {
		element.className = cls;
	}

	function setDataText(json) {
		presetDataText.value = JSON.stringify(json, null, '\t');
	}

	function setPresetData() {
		var name = getSelectedPreset();

		socket.emit('preset-getByName', name, function(err, preset) {
			if (err) {
				alert(err);
				return;
			}

			setDataText(preset);
		});
	}

	// ================================================================

	// ================ POLYFILLS =============================

	function polyfills() {
		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
		})();

		window.navigator.getUserMedia = (function() {
			// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// 	return navigator.mediaDevices.getUserMedia;
			// }

			return window.navigator.getUserMedia ||
				window.navigator.webkitGetUserMedia ||
				window.navigator.mozGetUserMedia ||
				window.navigator.msGetUserMedia;
		})();

		window.URL = (function() {
			return window.URL || window.webkitURL;
		})();

		window.MediaSource = (function() {
			return window.MediaSource || window.WebKitMediaSource;
		})();

		window.AudioContext = (function() {
			return window.AudioContext || window.webkitAudioContext;
		})();
	}

	// ================================================================	
})(window.socketConnection);