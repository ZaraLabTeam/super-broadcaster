// ================ DEPENDENCIES =============================

// NPM Modules
var piblaster = require('pi-blaster.js');
var fs = require('fs');

// Project Modules
var broadcaster = require('../broadcaster');
var logger = require('../logging/logger');
var colors = require('./colors');

// ================================================================

// ================ IMPLEMENTATION =============================

// GPIO pins (different from actual pin numbers)
var led1 = {
	RED: 17,
	GREEN: 27,
	BLUE: 4
};

var led2 = {
	RED: 25,
	GREEN: 22,
	BLUE: 24
};

var LEDS = [led1, led2];

// Prevent modification of the leds pins
LEDS.forEach(function(led) {
	Object.freeze(led);
});

var COLOR_DURATION = 50; // Single color duration
var COLOR_CHANGES = 50; // Color changes per interval
var COLOR_STEP = 0.02;
var REP_INTERVAL = COLOR_DURATION * COLOR_CHANGES; // Repetition interval

var COLORS_SAVE_PATH = __dirname + '/colors.json';

// Store the timer ids
var intervalId = null;
var delayed = [];

// Colors
var reset = {
	name: 'black',
	r: 0,
	g: 0,
	b: 0
};

broadcaster.event.on('broadcast-abort', resetPins);

broadcaster.event.on('broadcast-started', function() {
	resetPins();

	logger.log('Starting lightshow!', 'success');
	broadcastMode();
});

broadcaster.event.on('broadcast-ended', function() {
	resetPins();
	standbyMode();

	logger.log('Lightshow ended', 'warning');
});

function lightShow() {
	colorTransition(5, colors['zaraGreen'], colors['Some Cherveno']);
}

function init() {
	intervalId = setInterval(lightShow, REP_INTERVAL);

	// After the initial animation stay green
	setTimeout(function() {
		resetPins();

		standbyMode();
	}, REP_INTERVAL * 5);
}


function broadcastMode() {
	setColor(led1, colors.orangy);
	setColor(led2, colors.orangy);
}

function standbyMode() {
	setColor(led1, colors.zaraGreen);
	setColor(led2, colors.zaraGreen);
}

function resetPins() {
	if (intervalId) {
		clearInterval(intervalId);
	}

	if (delayed.length) {
		delayed.forEach(function(timer) {
			timer.cancel();
		});
	}

	setColor(led1, reset);
	setColor(led2, reset);
}

function setColor(led, color) {

	try {
		if (isNumber(+led)) {
			led = LEDS[led];
		}

		piblaster.setPwm(led.RED, color.r);
		piblaster.setPwm(led.GREEN, color.g);
		piblaster.setPwm(led.BLUE, color.b);
	} catch (e) {
		logger.log(e.toString(), 'danger');
	}

	console.log('{{name}}: {{r}}, {{g}}, {{b}}'.formatPV(color));
}

function saveColor(color) {
	console.log('Save Color');
	if (validateColor(color)) {
		colors[color.name] = color;

		fs.writeFile(COLORS_SAVE_PATH, stringify(colors), null, function(err) {
			if (err) {
				logger.log('Error saving the colors', 'danger');
				logger.log(err.toString(), 'danger');
			} else {
				logger.log('New color saved to colors', 'success');
			}
		});
	}
}

// ================================================================

// ================ ANIMATIONS =============================

function colorTransition(iterations, color1, color2) {
	var col1 = clone(color1),
		col2 = clone(color2);

	for (var i = 0; i < iterations; i++) {
		var delay1 = delay(setColor.bind(null, led1, clone(col1)), COLOR_DURATION),
			delay2 = delay(setColor.bind(null, led2, clone(col2)), COLOR_DURATION);

		while (true) {
			var transitions = [];

			transitions.push(transitionChannel(col1, color2, 'r'));
			transitions.push(transitionChannel(col1, color2, 'g'));
			transitions.push(transitionChannel(col1, color2, 'b'));
			delay1.delay(setColor.bind(null, led1, clone(col1)), COLOR_DURATION);

			transitions.push(transitionChannel(col2, color1, 'r'));
			transitions.push(transitionChannel(col2, color1, 'g'));
			transitions.push(transitionChannel(col2, color1, 'b'));
			delay2.delay(setColor.bind(null, led2, clone(col2)), COLOR_DURATION);

			delayed = [delay1, delay2];

			if (transitions.every(function(ch) {
				return ch;
			})) {
				break;
			}
		}

		var swap = clone(color1);
		color1 = clone(color2);
		color2 = swap;
	}
}

function simpleTransition() {
	var col1 = clone(colors.zaraGreen),
		col2 = clone(colors.zaraGreen);

	col1.g = 0;
	col2.g = 1;

	var delay1 = delay(setColor.bind(null, led1, col1), COLOR_DURATION),
		delay2 = delay(setColor.bind(null, led2, col2), COLOR_DURATION);

	for (var i = 1; i <= COLOR_CHANGES; i++) {
		delay1
			.delay(setColor.bind(null, led1, {
				r: col1.r,
				g: col1.g + COLOR_STEP * i,
				b: col1.b
			}), COLOR_DURATION);

		delay2
			.delay(setColor.bind(null, led2, {
				r: col2.r,
				g: col2.g - COLOR_STEP * i,
				b: col2.b
			}), COLOR_DURATION);
	}

	delayed = [delay1, delay2];
}

function transitionChannel(color, target, channel) {
	if (Math.abs(color[channel] - target[channel]) > 0.02) {
		if (color[channel] < target[channel]) {
			color[channel] += COLOR_STEP;
		} else {
			color[channel] -= COLOR_STEP;
		}

		return false;
	}

	return true;
}

// ================================================================

// ================ HELPERS =============================

function delay(fn, t) {
	// private instance variables
	var queue = [],
		self, timer;

	function schedule(fn, t) {
		timer = setTimeout(function() {
			timer = null;
			fn();
			if (queue.length) {
				var item = queue.shift();
				schedule(item.fn, item.t);
			}
		}, t);
	}

	self = {
		delay: function(fn, t) {
			// if already queuing things or running a timer, 
			//   then just add to the queue
			if (queue.length || timer) {
				queue.push({
					fn: fn,
					t: t
				});
			} else {
				// no queue or timer yet, so schedule the timer
				schedule(fn, t);
			}

			return self;
		},
		cancel: function() {
			clearTimeout(timer);
			queue = [];
		}
	};

	return self.delay(fn, t);
}

function clone(obj) {
	var cloned = JSON.parse(JSON.stringify(obj));

	return cloned;
}

function stringify(json) {
	var str = JSON.stringify(json, null, '\t');
	return str;
}

function isNumber(x) {
	return !isNaN(x);
}

function validateColor(color) {
	return true;
}

// ================================================================

resetPins();
init();

module.exports = {
	setColor: setColor,
	ledsCount: LEDS.count,
	saveColor: saveColor,
	colors: colors
};