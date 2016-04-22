// ================ DEPENDENCIES =============================

// NPM Modules
var piblaster = require('pi-blaster.js');

// Project Modules
var broadcaster = require('../broadcaster');
var logger = require('../logging/logger');

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

// Repetition interval
var REP_INTERVAL = 1500;
// Number of color changes per iteration
var COLOR_DURATION = 500;

// Store the timer ids
var intervalId = null;
var delayed = [];

broadcaster.event.on('broadcast-started', function() {
	resetPins();

	logger.log('Starting lightshow!', 'success');
	broadcastMode();
});

broadcaster.event.on('broadcast-ended', function() {
	if (intervalId) {
		clearInterval(intervalId);
	}

	if (delayed.length) {
		delayed.forEach(function(timer) {
			clearTimeout(timer);
		});
	}

	resetPins();

	logger.log('Lightshow ended', 'warning');
});

function lightShow() {
	var delay1 = delay(setColor.bind(null, led1, zaraGreen), COLOR_DURATION)
		.delay(setColor.bind(null, led1, orangy), COLOR_DURATION)
		.delay(setColor.bind(null, led1, liliac), COLOR_DURATION);

	var delay2 = delay(setColor.bind(null, led2, liliac), COLOR_DURATION)
		.delay(setColor.bind(null, led2, zaraGreen), COLOR_DURATION)
		.delay(setColor.bind(null, led2, orangy), COLOR_DURATION);

	delayed = [delay1, delay2];
}

function init() {
	intervalId = setInterval(lightShow, REP_INTERVAL);

	// After the initial animation stay green
	setTimeout(function() {
		clearInterval(intervalId);

		if (delayed.length) {
			delayed.forEach(function(timer) {
				clearTimeout(timer);
			});
		}

		standbyMode();
	}, REP_INTERVAL * 5);
}

function broadcastMode() {
	setColor(led1, orangy);
	setColor(led2, orangy);
}

function standbyMode() {
	setColor(led1, zaraGreen);
	setColor(led2, zaraGreen);
}

function resetPins() {
	setColor(led1, orangy);
	setColor(led2, orangy);
}

// ================================================================

// ================ COLORS =============================

var reset = [0, 0, 0];

var zaraGreen = [0.572, 0.811, 0.15];
var orangy = [0.913, 0.309, 0.05];
var liliac = [0.913, 0.309, 0.725];

function setColor(led, rgbArray) {
	piblaster.setPwm(led.RED, rgbArray[0]);
	piblaster.setPwm(led.GREEN, rgbArray[1]);
	piblaster.setPwm(led.BLUE, rgbArray[2]);

	console.log('rgb: {{0}}, {{1}}, {{2}}'.formatPV(rgbArray));
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

// ================================================================

resetPins();
init();