var socketServer = require('./sockets.js'),
	staticServer = require('./static.js');
	
staticServer.serve({port:8901});
socketServer.serve({port:8902});