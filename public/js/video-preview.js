(function() {
	var hostname = window.location.hostname;
	var canvas = document.getElementById('videoCanvas');
	var addr = 'ws://{{hn}}:8007'.formatPV({
		hn: hostname
	});

	var client = new WebSocket(addr);

	var player = new jsmpeg(client, {
		canvas: canvas,
		autoplay: true
	});
})();