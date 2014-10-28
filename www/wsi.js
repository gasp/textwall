// let's invite Firefox to the party.
if (window.MozWebSocket) {
	window.WebSocket = window.MozWebSocket;
}

var WebSocketInterface = function(url){
	var conn = new WebSocket(url);
 
	var callbacks = {};
 
	this.on = function(event_name, callback){
		callbacks[event_name] = callbacks[event_name] || [];
		callbacks[event_name].push(callback);
		return this;// chainable
	};

	this.trigger = function(event_name, event_data){
		var payload = JSON.stringify({event:event_name, data: event_data});
		conn.send(payload); // send JSON data to socket server
		return this;
	};
 
	// dispatch to the right handlers
	conn.onmessage = function(evt){
		console.log("socket: message",evt.data);
		try{
			var json = JSON.parse(evt.data);
		}
		catch(er) {
			console.log("socket: unreadable message or unable to complate operation based on %s",evt.data);
			console.log(er);
		};
		dispatch(json.event, json.data); // move this back into the try
	};

	conn.onclose = function(){dispatch('close',null)}
	conn.onopen = function(ev){dispatch('open',{timeStamp:ev.timeStamp})}
 
	var dispatch = function(event_name, message){
//		console.log(callbacks);
		var chain = callbacks[event_name];
		if(typeof chain == 'undefined') return; // no callbacks for this event
		for(var i = 0; i < chain.length; i++){
			chain[i]( message )
		}
	}
};