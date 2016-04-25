(function(window) {
	'use strict';

	window.InitColorPicker = function(socket) {
		var red = document.getElementById('slide-red'),
			green = document.getElementById('slide-green'),
			blue = document.getElementById('slide-blue'),
			sliders = document.getElementById('sliders'),
			checkboxes = document.querySelectorAll('#checkboxes input[type="checkbox"]');

		sliders.addEventListener('input', function() {
			var leds = getSelected(checkboxes);
			if (leds.length) {
				leds.forEach(function(led, index) {
					console.log(index, {
						r: red.value,
						g: green.value,
						b: blue.value
					});
					socket.emit('gpio-setColor', index, {
						r: red.value,
						g: green.value,
						b: blue.value
					});
				});
			}
		});

		function getSelected(checkboxElements) {
			var selected = [],
				length = checkboxElements.length;

			for (var i = 0; i < length; i++) {
				var element = checkboxElements[i];
				if (element.checked) {
					selected.push(element);
				}
			}

			return selected;
		}
	};

})(window);