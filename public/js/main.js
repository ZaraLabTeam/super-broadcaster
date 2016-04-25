(function(socket, ss) {
	'use strict';

	// Todo: auto scroll logger window

	// ================ INITIALIZATION =============================

	var DEFAULT_CONFIG_NAME = 'default264';

	polyfills();

	socket.establishConnection()
		.then(setupSelectMenu)
		.then(setPresetData)
		.then(InitLogger.bind(window, socket))
		.then(InitColorPicker.bind(window, socket))
		.catch(function(err) {
			alert(err.toString());
			console.log(socket);
		});

	var configSelect = document.getElementById('config');
	var toggleable = document.getElementById('toggle');
	var presetDataText = document.getElementById('preset-data');
	var videoPlayer = document.getElementById('player');
	var cpuLog = document.getElementById('cpu-log');
	var lblOnAir = document.getElementById('on-air');

	var btnBlocks = document.querySelectorAll('.btn-block');
	var btnStart = document.getElementById('start');
	var btnStop = document.getElementById('stop');
	var btnSetConfig = document.getElementById('set-config');
	var btnDeleteConfig = document.getElementById('delete-config');
	var btnSaveConfig = document.getElementById('save-config');
	var btnClear = document.getElementById('clear');
	var cbClientAudio = document.getElementById('client-audio');



	// ================================================================

	// ================ UI EVENTS =================================
	
	for (var i = 0; i < btnBlocks.length; i++) {
		var block = btnBlocks[i];

		block.addEventListener('click', buttonsHandler, false);
	}

	function buttonsHandler(evt) {
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
			return;
		}

		evt.preventDefault();
	}

	// On Config Select
	configSelect.addEventListener('change', function() {
		setPresetData();
	}, false);

	// On Start
	function start() {
		if (cbClientAudio.checked) {
			// When the server receives the auido it will signal
			// the broadcaster to start the broadcast stream
			window.audioStream.start();
		} else {
			socket.emit('broadcast-start');
		}
		
		btnStart.disabled = true;
	}

	// On Stop
	function stop() {
		socket.emit('broadcast-stop');
		window.audioStream.stop();
		btnStart.disabled = false;
		
		setTimeout(changeCssClass.bind(null, lblOnAir, 'hidden'), 500);
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
			socket.emit('preset-add', config, function(err, name) {
				if (err) {
					alert(err.toString());
					return;
				}

				// Bug: saving existing preset appends it again to the dropdown menu
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
		document.getElementById('messages').innerHTML = '';
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

		String.prototype.formatPV = function(args) {
			if (!args) return this;

			var str = this;

			for (var arg in args) {
				str = str.replace(
					RegExp("\\{\\{" + arg + "\\}\\}", "gi"), args[arg]);
			}

			return str;
		};
	}

	// ================================================================	
})(window.socketConnection);