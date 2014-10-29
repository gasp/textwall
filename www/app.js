var app = {
	socket : null,
	url: 'ws://localhost:8902',
	$t : null,
	$input: null,
	init: function(){

		app.$t = $("#t");
		app.$input = $("#sampler");
		app.$t.css({height:$(window).height()} -  map.unit.height)
		app.url = 'ws://'+window.location.hostname+':8902'
		app.connect();
		app.listen.sockets();
		app.listen.clicks();
		app.listen.keys();
		app.$input.focus().on("blur change", function () {
			$(this).focus();
			setTimeout(function () {
				app.$input.focus();
			}, 1);
		});
	}
};

app.connect = function(){
	app.socket = new WebSocketInterface(app.url);
};
app.refresh = function(){
	// ask for map data
	app.socket.trigger("map",{
		minx: map.orig.x,
		maxx: map.orig.x + map.size.x,
		miny: map.orig.y,
		maxy: map.orig.y + map.size.y,
	});
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

			console.log("todo: restarting app.socket, app.listen.sockets may not be reinitialized properly");

			window.setTimeout(function(){
				$("#bar").find('.status').text('reconnecting');
				app.socket = null;
				app.connect();
			}, 5000)
		});
	
		app.socket.on('welcome', function(data) {
			window.me = data;
			console.log('.l.x'+me.x+'.y'+me.y);
			console.log($('.l.x'+me.x+'.y'+me.y));
			$('.l.x'+me.x+'.y'+me.y).addClass("me");
			// time to refresh
			app.refresh();
		});
	
		app.socket.on('users', function(users) {
			window.users = users;
			for (var i = 0; i < users.length; i++) {
				if(users[i].id !== me.id){
					coords = {
						id: users[i].id,
						x : users[i].x,
						y : users[i].y
					}
					map.sel(coords,'user');
					map.sel(coords,'u'+users[i].id);
				}
			}
		});
		app.socket.on('map', function(mdata) {
			console.log("just got new map data from server");
			map.import(mdata);
			map.render();
		});

		app.socket.on('key', function(key) {
			// console.log({x:key.x, y:key.y});
			map.data[key.x][key.y] = key.k;
			map.set({x:key.x, y:key.y}, key.k)
		});

		app.socket.on('pos', function(pos) {
			// console.log("pos message",pos);
	
			// don't track my pos
			if(pos.id == me.id) return false;

			// search for the user
			for (var i = users.length - 1; i >= 0; i--) {
				if(users[i].id == pos.id){
					map.rem({x:users[i].x,y:users[i].y},'user','u'+pos.id);
					coords = {x:pos.x,y:pos.y};
					map.sel(coords,'user');
					map.sel(coords,'u'+pos.id);
					//update user
					users[i].x = pos.x;
					users[i].y = pos.y;
				}
			}
		});
	}, ///sockets
	keys: function(){
		app.$input.on('keyup keydown keypress', function(ev) {
			// del
			if(ev.which == 8){
				app.socket.trigger("key",{x:me.x, y:me.y, k:" "});
				map.set({x:me.x,y:me.y}," ");
				// don't go to previous page
				return false;
			}
		});

		app.$input.on('input', function() {
			var key = $("#sampler").val();
			$("#sampler").val('');
			if(key.length > 1) {
				key = key[0];
			}

			// can be resticted with
			// var patt =/(\w|'|"|\||\\|\/|\.|;|,|:|•|-|\+|á|à|â|ë|ç|é|è|ê|ë|í|ì|î|ï|ó|ò|ô|ö|ú|ù|û|ü|\?|\!|§|\@|\&|\$|\*|\(|\)|\~|\<|\>|\%|\[|\]|\{|\}|\^|\#|\=)/g;
			// if (patt.test(key))

			if (key.length){ // did I typed something ?
				app.socket.trigger("key",{x:me.x, y:me.y, k:key});
				map.set({x:me.x, y:me.y}, key);
				me.x = me.x + 1;
				app.socket.trigger("pos",{x:me.x, y:me.y});
			}
			var coords = {x:me.x, y:me.y};
			map.sel(coords, 'me', true);
			app.socket.trigger("pos",coords);
		});

		// any directions
		app.$input.on('keydown', function(ev) {
			if(ev.which.toString().match(/^(8|32|37|38|39|40)$/)) {

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

				console.log('todo: check if i am near a wall, then change orig and call app.refresh');
				ev.preventDefault();
				var coords = {x:me.x, y:me.y};
				map.sel(coords, 'me', true);
				app.socket.trigger("pos",coords);
			}
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

