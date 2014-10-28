"use strict";

var WebSocketServer = require('ws').Server,
	map = require('./map.js');

map.reset();
var welcome = "hello world !     welcome all.";
var l = Math.min(welcome.length, map.data.length);
for (var i = 0; i < l ; i++) {
	map.set(i,5,welcome[i]);
};
console.log(map.ascii());

var serve = function(options) {
	var port = options.port || 9802;	
	var wss = new WebSocketServer({port: port});
	console.log('serving socket on http://localhost:' + port);
	for (var o in wss.options) {
		console.log("option %s: %s", o, JSON.stringify(wss.options[o], null, 4));
	}

	wss.on('connection', function(client) {
		client.minx = 0;
		client.miny = 0;
		client.maxx = 20;
		client.maxy = 10;
		client.x = Math.floor(Math.random()*3);
		client.y = Math.floor(Math.random()*2);
		client.id = client.upgradeReq.headers['sec-websocket-key'];

		client.on('close', function(ws) {
			console.log('disconnected: %s', client.id);
			console.log('-- %d clients', wss.clients.length);
		});

		console.log('connected: %s', client.id);
		console.log('-- %d clients', this.clients.length);

		// send wall message with user list
		wss.wall.users()

		// welcome with my infos
		var wjson = {event: "welcome", data: {id: client.id, x: client.x, y: client.y}};
		client.send(JSON.stringify(wjson));

		client.on('message', function(message) {
			console.log('received: %s', message);
			try{
				var json = JSON.parse(message);
			}
			catch(er) {
				console.error('error reading message '+ message);
				console.error(er);
			};
			parse(json);
			// TODO remove this echo ?
			client.send(message);
		});

		var parse = function(command){
			if(command.event == "pos") {

				// updating my pos
				client.x = command.data.x;
				client.y = command.data.y;

				var pdata = command.data;
				pdata.id = client.id;

				// telling everyone
				wss.wall.pos(pdata);
			}
			if(command.event == "key") {
				// update data
				map.set(command.data.x, command.data.y, command.data.k);

				// telling everyone
				wss.wall.key(command.data)
			}
			if(command.event == "map") {
				// send needed data to the client
				var iter = map.box(command.data.minx, command.data.maxx, command.data.miny, command.data.maxy),
					mdata = [];
				for (var i = iter.length - 1; i >= 0; i--) {
					mdata.push(map.data[iter[i]]);
				}
				client.send(JSON.stringify({event:"map", data: mdata}));
			}
		};
	});


	wss.wall = {
		users: function() {
			var users = [];
			for (var i = wss.clients.length - 1; i >= 0; i--) {
				console.log(wss.clients[i].id);
				users.push({id: wss.clients[i].id, x: wss.clients[i].x, y: wss.clients[i].y});
			}
			var json = {event:"users", data: users};
			wss.broadcast(json);
		},
		pos: function(pdata) {
			var json = {event:"pos", data: pdata};
			wss.broadcast(json);
		},
		key: function(kdata) {
			var json = {event:"key", data: kdata};
			wss.broadcast(json);
		}
	}

	wss.broadcast = function(data) {
		for(var i in this.clients)
			this.clients[i].send(JSON.stringify(data));
	};
}

module.exports = {serve: serve};