var app = {
	socket : null,
	$t : null,
	init: function(){
		app.$t = $("#t");
		app.$t.css({height:$(window).height()})
		
		app.connect();
		app.listen.sockets();
		app.listen.clicks();
		app.listen.keys();

	}
};

app.connect = function(){
	app.socket = new WebSocketInterface('ws://localhost:8902');
};
app.listen = {
	sockets: function(){
	
		// listen to sockets
		
		app.socket.on('open',function(d) {
			$("#bar")
			.addClass('open').removeClass('close')
			.find('.status').text('connected');
		});
		app.socket.on('close',function(d) {
			$("#bar")
				.addClass('close').removeClass('open')
				.find('.status').text('disconneced');

			console.log("restarting app.socket");

			window.setTimeout(function(){
				$("#bar").find('.status').text('reconnecting');
			})
			window.setTimeout(function(){
				
				app.socket = null;
				app.connect();
			}, 5000)

		
		});
	
		app.socket.on('welcome', function(data) {
			window.me = data;
			console.log('.l.x'+me.x+'.y'+me.y);
			console.log($('.l.x'+me.x+'.y'+me.y));
			$('.l.x'+me.x+'.y'+me.y).addClass("me");
		});
	
		app.socket.on('users', function(users) {
			window.users = users;
			for (var i = 0; i < users.length; i++) {
				if(users[i].id != me.id){
					coords = {
						x : users[i].x,
						y : users[i].y
					}
					map.sel(coords,'user');
					map.sel(coords,'u'+users[i].id);
				}
			}
		});
		app.socket.on('map', function(mdata) {
			map.import(mdata);
			map.render();
		});

		app.socket.on('key', function(key) {
			console.log({x:key.x, y:key.y});
			map.data[key.x][key.y] = key.k;
			map.set({x:key.x, y:key.y}, key.k)
		});

		app.socket.on('pos', function(pos) {
			console.log("pos message",pos);
	
			// don't track my pos
			if(pos.id == me.id) return false;

			// search for the user
			for (var i = users.length - 1; i >= 0; i--) {
				if(users[i].id == pos.id){

					console.log("gotcha",users[i]);
					map.rem({x:users[i].x,y:users[i].y},'user','u'+pos.id);
					coords = {x:pos.x,y:pos.y};
					map.sel(coords,'user');
					map.sel(coords,'u'+pos.id);
					console.log(i, users[i])
				
					//update user
					users[i].x = pos.x;
					users[i].y = pos.y;
				}
			}
		});
	}, ///sockets
	keys: function(){
		$(window).on('keyup keydown keypress', function(ev) {
			// del
			if(ev.which == 8){
				app.socket.trigger("key",{x:me.x, y:me.y, k:" "});
				map.set({x:me.x,y:me.y}," ");
				// don't go to previous page
				return false;
			}
		});
		$(window).on('keydown', function(ev) {

			// disable preventdefault except some other key is pressed
			if(ev.altKey == false && ev.altGraphKey == false && ev.metaKey == false 
				&& (ev.which < 112 && ev.which > 123) ) // F1 keys
				ev.preventDefault();

			var patt =/\w/g;
			var key = String.fromCharCode(ev.keyCode);
			if (ev.shiftKey == false) key = key.toLowerCase();
		
			if (patt.test(key)){ // did I typed something ?
				app.socket.trigger("key",{x:me.x, y:me.y, k:key});
				map.set({x:me.x, y:me.y}, key);
				me.x = me.x + 1;
				app.socket.trigger("pos",{x:me.x, y:me.y});
			}
			else {
				// space bar
				if(ev.which == 32){
					app.socket.trigger("key",{x:me.x, y:me.y, k:" "});
					map.set({x:me.x,y:me.y}," ");
				}
			
				if(ev.which.toString().match(/^(37|8)$/)) // left or del
					me.x = me.x - 1;
				if(ev.which.toString().match(/^(39|32)$/)) // right or space
					me.x = me.x + 1;
				if(ev.which.toString().match(/^38$/)) // up
					me.y = me.y - 1;
				if(ev.which.toString().match(/(40|13)/)) // down
					me.y = me.y + 1;
				app.socket.trigger("pos",{x:me.x, y:me.y});
			}

			var coords = {x:me.x,y:me.y};
			map.sel(coords,'me',true);
		});
	},
	clicks: function () {
		app.$t.on('click', '.l', function(){
			x = $(this).data('x');
			y = $(this).data('y');
			if(x == me.x && y == me.y)
				console.log("nothing");
			else{
				me.x = x;
				me.y = y;
				app.socket.trigger("pos",{x:x,y:y});
				map.sel({x:x,y:y},'me',true);
			}
		});
	}
	
	
};
