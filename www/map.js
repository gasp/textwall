var map = {
	data : [], // map.data[x][y] = "a";
	text : '', // "abc\ndef"
	size : {x:30,y:20},
	init : function() {
		map.reset();
		map.render();
	},
	import: function(mdata) {
		map.data = mdata;
		map.size.x = mdata.length;
		var maxy = 0;
		for (var i = map.size.x - 1; i >= 0; i--) {
			maxy = Math.max(mdata[i].length, maxy);
		}
		map.size.y = maxy;
	},
	reset : function() {
		for (var i = 0; i < map.size.x; i++) {
			map.data[i] = [];
			for (var j = 0; j < map.size.y; j++) {
				map.data[i][j] =" ";
			};
		};
	},
	draw : function() {
		map.text = '';
		for (var i = 0; i < map.size.x; i++) {
			for (var j = 0; j < map.size.y; j++) {
				map.text += "<span>"+map.data[i][j]+"</span>"
			}
			map.text += "\n";
		};
		$("#t").html(map.text);
	},
	render : function() {
		$t = $("#t")
		$t.empty();
		for (var j = 0; j < map.size.y; j++) {
			var div = document.createElement("div");
			for (var i = 0; i < map.size.x; i++) {
				var span = document.createElement("span");
				$(span)
					.addClass('l x'+i+' y'+j)
					.data('x',i.toString()).data('y',j.toString())
					.text(map.data[i][j]);
				$(div).append(span);
			}
			$t.append(div);
		}
	},
	set : function(coords, value) {
		map.data[coords.x][coords.y] = value;
		$('.l.x'+coords.x+'.y'+coords.y).text(value); // animate ?
	},
	sel : function(coords, cl, unique) {
		if(typeof unique !== "undefined") $('.l.'+ cl).removeClass(cl);
		$('.l.x'+coords.x+'.y'+coords.y).addClass(cl);
	},
	rem : function(coords, cl) {
		$('.l.x'+coords.x+'.y'+coords.y).removeClass(cl);
	}
}