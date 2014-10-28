"use strict";

var WebSocketServer = require('ws').Server;

var serve = function(options) {
	var port = options.port || 9802;
	var welcome = options.welcome || "hello world !     welcome all."
	var wss = new WebSocketServer({port: port});
	console.log('serving socket on http://localhost:'+port)

	var users = [];
	var map = {
		data:[], // {x:10,y:10,v:"a"}
		size : {x:20,y:10}, // x are cols y are lines
		reset : function() {
			for (var i = 0; i < map.size.x; i++) {
				for (var j = 0; j < map.size.y; j++) {
					map.data.push({x:i,y:j,v:" "});
				};
			};
			var l = Math.min(welcome.length, map.data.length);
			for (var i = 0; i < l ; i++) {
				map.set(i,5,welcome[i]);
			};
		},
		set: function (x,y,v) {
			var i = map.find(x,y)
			if(i === null) map.data.push({x:x,y:y,v:v});
			else map.data[i].v = v;
		},
		get: function (x,y) {
			var i = map.find(x,y);
			if(i === null) return '•';
			else return map.data[i].v;
		},
		find: function (x,y) {
			for (var i = map.data.length - 1; i >= 0; i--) {
				if(map.data[i].x === x && map.data[i].y === y) {
					return i;
				}
			}
			return null;
		},
		box: function(minx, maxx, miny, maxy) {
			var results = []
			for (var i = map.data.length - 1; i >= 0; i--) {
				if( map.data[i].x < maxx && map.data[i].x > minx
					&& map.data[i].y < maxy && map.data[i].y > miny) {
					results.push(i);
				}
			}
			return results;
		},
		ascii : function () {
			var text = '';
			for (var j = 0; j < map.size.y; j++) {
				for (var i = 0; i < map.size.x; i++) {
					var c = map.get(i,j);
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
		var wjson = {event: "welcome", data: me};
		ws.send(JSON.stringify(wjson));

		ws.on('message', function(message) {
			console.log('received: %s', message);
			try{
				var json = JSON.parse(message);
			}
			catch(er) {
				console.log("error reading message "+ message);
				console.log(er);
			};
			parse(json);
			ws.send(message);
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
				map.set(command.data.x, command.data.y, command.data.k);

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
		}
	}

	wss.broadcast = function(data) {
		for(var i in this.clients)
			this.clients[i].send(JSON.stringify(data));
	};
}

module.exports = {serve: serve};