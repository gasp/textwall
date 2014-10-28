var map = {
	data : [], // map.data[{x:0,y:0,v:"a"}]
	text : '', // "abc\ndef"
	size : {x:20,y:20},
	orig : {x:0,y:0},
	unit : {},
	init : function() {

		// get a text block size
		var $span = $("<span>").addClass("l").text("?");
		$("#t").html($span);
		map.unit = {
			width: $span.width(),
			height: $span.height()
		};
		$span.remove();

		// setting the number of visible blocks
		map.size = {
			x: Math.ceil($(window).width() / map.unit.width),
			y: Math.ceil($(window).height() / map.unit.height) -1 // because there is a top bar
		};

		map.reset();
		map.render();

	},
	import: function(mdata) {
		for (var i = mdata.length - 1; i >= 0; i--) {
			map.data[mdata[i].x][mdata[i].y] = mdata[i].v;
		}
	},
	// make an empty map
	reset : function() {
		for (var i = 0; i < map.size.x; i++) {
			map.data[i] = [];
			for (var j = 0; j < map.size.y; j++) {
				map.data[i][j] =" ";
			};
		};
	},
	// flat draw on a pre
	draw : function() {
		map.text = '';
		for (var j = 0; j < map.size.y; j++) {
			for (var i = 0; i < map.size.x; i++) {
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
		if(map.data[coords.x] === undefined) map.data[coords.x] = []
		map.data[coords.x][coords.y] = value;
		$('.l.x'+coords.x+'.y'+coords.y).text(value); // animate ?
	},
	// select
	sel : function(coords, cl, unique) {
		if(typeof unique !== "undefined") $('.l.'+ cl).removeClass(cl);
		$('.l.x'+coords.x+'.y'+coords.y).addClass(cl);
	},
	// remove select
	rem : function(coords, cl) {
		$('.l.x'+coords.x+'.y'+coords.y).removeClass(cl);
	}
}