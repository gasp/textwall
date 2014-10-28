"use strict";

var WebSocketServer = require('ws').Server;

var serve = function(options) {
	var port = options.port || 9802;
	var welcome = options.welcome || "hello world !     welcome all."
	var wss = new WebSocketServer({port: port});
	console.log('serving socket on http://localhost:'+port)

	var users = [];
	var map = {
		data:[],
		size : {x:20,y:10}, // x are cols y are lines
		reset : function() {
			for (var i = 0; i < map.size.x; i++) {
				map.data[i] = [];
				for (var j = 0; j < map.size.y; j++) {
					map.data[i][j] = " ";
				};
			};
			var l = Math.min(welcome.length, map.data.length);
			for (var i = 0; i < l ; i++) {
				map.data[i][5] = welcome[i];
			};
		},
		ascii : function () {
			var text = '';
			for (var j = 0; j < map.size.y; j++) {
				for (var i = 0; i < map.size.x; i++) {
					var c = map.data[i][j];
					text += (c === ' ' || c === undefined) ? '.' : c;
				}
				text += "\n";
			}
			return text;
		}
	};

	map.reset();
	console.log(map.ascii());


	wss.on('connection', function(ws) {

		wss.on('close', function(ws) {
			console.log('disconnected', this, ws);
		});

		var me = {
			id: Math.floor(Math.random()*100000),
			x:  Math.floor(Math.random()*3),
			y:  Math.floor(Math.random()*2)
		};
		// add me to users, but keep the index
		me.index = users.push(me) -1;

		// send wall message with user list
		wss.wall.users()

		// welcome with my infos
		var wjson = {event:"welcome", data:me};
		ws.send(JSON.stringify(wjson));

		// send the map
		var mjson = {event:"map", data:map.data};
		wss.broadcast(mjson);

		ws.on('message', function(message) {
			console.log('received: %s', message);
			try{
				var json = JSON.parse(message);
				parse(json);
				ws.send(message);
			}
			catch(er) {
				console.log("error reading message "+ message);
				console.log(er);
			};
		});

		var parse = function(command){
			if(command.event == "pos") {

				// updating my pos
				users[me.index].x = command.data.x;
				users[me.index].y = command.data.y;

				var pdata = command.data;
				pdata.id = me.id;
				pdata.index = me.index

				// telling everyone
				wss.wall.pos(pdata);
			}
			if(command.event == "key") {
				// update data
				map.data[command.data.x][command.data.y] = [command.data.k]

				// telling everyone
				wss.wall.key(command.data)
			}
		};
	});

	wss.wall = {
		users: function() {
			var json = {event:"users", data:users};
			wss.broadcast(json);
		},
		pos: function(pdata) {
			var json = {event:"pos", data:pdata};
			wss.broadcast(json);
		},
		key: function(kdata) {
			var json = {event:"key", data:kdata};
			wss.broadcast(json);
		},
		// should not be used...
		map: function(mdata) {
			var json = {event:"pos", data:mdata};
			wss.broadcast(json);
		}
	}

	wss.broadcast = function(data) {
		for(var i in this.clients)
			this.clients[i].send(JSON.stringify(data));
	};
}

module.exports = {serve: serve};