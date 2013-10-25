"use strict";

var WebSocketServer = require('ws').Server;

var serve = function(options) {
	var port = options.port || 9802;
	var wss = new WebSocketServer({port: port});
	console.log('serving socket on http://localhost:'+port)

	wss.on('connection', function(ws) {
		ws.on('message', function(message) {
			console.log('received: %s', message);
		});
		ws.send('something');
		ws.send(JSON.stringify({json:true}))
	});
}

module.exports = {serve: serve};