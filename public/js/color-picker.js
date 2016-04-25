(function(window) {
	'use strict';

	window.InitColorPicker = function(socket) {
		var picker = document.getElementById('color-picker'),
			checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');

		picker.addEventListener('input', function(evt) {
			if (evt.target.nodeName !== 'INPUT') {
				return;
			}

			var ledNumber = 0;
			if (evt.target.id.indexOf('led2') != -1) {
				ledNumber = 1;
			}

			console.log(ledNumber, hexToRgb(evt.target.value));

			socket.emit('gpio-setColor', ledNumber, hexToRgb(evt.target.value));

		});

		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16) / 255,
				g: parseInt(result[2], 16) / 255,
				b: parseInt(result[3], 16) / 255
			} : null;
		}
	};

})(window);