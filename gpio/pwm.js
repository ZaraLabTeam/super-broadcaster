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

// Colors
var reset = {
	name: 'black',
	r: 0,
	g: 0,
	b: 0
};

var zaraGreen = {
	name: 'zaraGreen',
	r: 0.572,
	g: 0.811,
	b: 0.15
};

var orangy = {
	name: 'orangy',
	r: 0.913,
	g: 0.109,
	b: 0.05
};

var liliac = {
	name: 'liliac',
	r: 0.913,
	g: 0.309,
	b: 0.725
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
		resetPins();

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
	console.log('{{name}}: {{r}}, {{g}}, {{b}}'.formatPV(color));

	try {
		piblaster.setPwm(led.RED, color.r);
		piblaster.setPwm(led.GREEN, color.g);
		piblaster.setPwm(led.BLUE, color.b);
	} catch (e) {
		logger.log(e.toString(), 'danger');
	}	
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