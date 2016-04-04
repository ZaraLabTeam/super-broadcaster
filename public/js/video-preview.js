(function() {
	var hostname = window.location.hostname;
	var canvas = document.getElementById('videoCanvas');

	function play() {
		var client = new WebSocket('ws://{{hn}}:8007'.formatPV({
			hn: hostname
		}));
		var player = new jsmpeg(client, {
			canvas: canvas
		});
	}

	window.playVideo = play;
})();