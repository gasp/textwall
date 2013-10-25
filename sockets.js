"use strict";

var WebSocketServer = require('ws').Server;

var serve = function(options) {
	var port = options.port || 9802;
	var wss = new WebSocketServer({port: port});
	console.log('serving socket on http://localhost:'+port)

	wss.on('connection', function(ws) {
		ws.on('message', function(message) {
			console.log('received: %s', message);
			try{
				var json = JSON.parse(message)
				
				setTimeout(function(){ // adding a little lag
					ws.send(message);
				},
				100);
				
			}
			catch(er) {
				console.log("error reading message "+ message);
				console.log(er);
			};
		});
		ws.send('something');
		ws.send(JSON.stringify({json:true}))
	});
}

module.exports = {serve: serve};