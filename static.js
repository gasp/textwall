var connect = require('connect');
var serveStatic = require('serve-static');

var serve = function(options) {
	var app = connect();
	port = options.port || 8901;
	app.use(serveStatic(__dirname+'/www'));
	app.listen(port);
	console.log('serving static on http://localhost:' + port);
};

module.exports = {serve: serve};
