var connect = require('connect');

var serve = function(options) {
	port = options.port || 8901;
	connect.createServer(
		connect.static(__dirname+'/www')
	).listen(port);
	console.log('serving static on http://localhost:'+port)
};

module.exports = {serve: serve};