(function() {
	var hostname = window.location.hostname;
	var canvas = document.getElementById('videoCanvas');
	var client = new WebSocket('ws://{{hn}}:8007'.formatPV({
		hn: hostname
	}));

	function play() {
		var player = new jsmpeg(client, {
			canvas: canvas,
			autoplay: true
		});
	}

	window.playVideo = play;
})();