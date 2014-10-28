var map = {
	data:[], // {x:10,y:10,v:"a"}
	size : {x:20,y:10}, // x are cols y are lines
	reset : function() {
		for (var i = 0; i < map.size.x; i++) {
			for (var j = 0; j < map.size.y; j++) {
				map.data.push({x:i,y:j,v:" "});
			};
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

module.exports = map;