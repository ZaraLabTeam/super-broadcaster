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
var REP_INTERVAL = 4000;
// Number of color changes per iteration
var COLOR_DURATION = 1000;

// Store the timer ids
var intervalId = null;

broadcaster.event.on('broadcast-started', function() {
	resetPins();

	logger.log('Starting lightshow!', 'success');
	intervalId = setInterval(lightShow, REP_INTERVAL);
});

broadcaster.event.on('broadcast-ended', function() {
	clearInterval(intervalId);

	// double reset
	resetPins();
	delay(resetPins, REP_INTERVAL);
	
	logger.log('Lightshow ended', 'warning');
});

function lightShow() {	
	delay(setColor.bind(null, led1, zaraGreen), COLOR_DURATION)
		.delay(setColor.bind(null, led1, orangy), COLOR_DURATION)
		.delay(setColor.bind(null, led1, liliac), COLOR_DURATION)
		.delay(setColor.bind(null, led1, reset), COLOR_DURATION);

	
	delay(setColor.bind(null, led2, zaraGreen), COLOR_DURATION)
		.delay(setColor.bind(null, led2, orangy), COLOR_DURATION)
		.delay(setColor.bind(null, led2, liliac), COLOR_DURATION)
		.delay(setColor.bind(null, led2, reset), COLOR_DURATION); 	
}

function resetPins() {
	setColor(led1, reset);
	setColor(led2, reset);
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