// ================ DEPENDENCIES =============================

// NPM Dependencies
var path = require('path');
var node_static = require('node-static');
var static_files = new node_static.Server(path.join(__dirname,'../public'));

// ===========================================================

// ================ IMPLEMENTATION ==============================

var publicFiles = /^\/public\/(.*)$/;

function handleHttp(req, res) {
	console.log('%s -> %s', req.method, req.url);

	if (req.method === 'GET') {
		if (publicFiles.test(req.url)) {
			req.addListener('end', function () {
				req.url = req.url.replace(publicFiles, '/$1');
				console.log('changed url ', req.url);
				static_files.serve(req, res);
			});

			req.resume();
		} else if (req.url === '/stream-example.html') {
			req.addListener('end', function () {
				static_files.serve(req, res);
			});

			req.resume();
		}
		else {
			req.addListener('end', function () {
				req.url = '/index.html';
				static_files.serve(req, res);
			});

			req.resume();
		}
	} 
	else {
		badRequest(res, 403);
	}	
}

function badRequest(res, code) {
	res.writeHead(code);
	res.end('Busted!');	
}

// ================================================================

// ================ EXPORTS =======================================

module.exports = {
	handle: handleHttp
};

// ================================================================