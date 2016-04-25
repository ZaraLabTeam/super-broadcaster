(function(window) {
	'use strict';

	window.InitColorPicker = function(socket) {
		var pickers = document.getElementById('pickers'),
			btnSave = document.getElementById('save-color');

		pickers.addEventListener('input', function(evt) {
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

		btnSave.addEventListener('click', function(evt) {
			evt.preventDefault();
			var name = prompt('Enter a name to save the color of Led 1: ');
			if (name) {
				var picker1 = document.querySelector('#pickers input[type="color"]');
				var color = hexToRgb(picker1.value);
				color.name = name;

				console.log(color);

				socket.emit('gpio-saveColor', color);
			} else {
				alert('Nyama takava darjava');
			}
		});

		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: (parseInt(result[1], 16) / 255).toFixed(3),
				g: (parseInt(result[2], 16) / 255).toFixed(3),
				b: (parseInt(result[3], 16) / 255).toFixed(3)
			} : null;
		}
	};

})(window);