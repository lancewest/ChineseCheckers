//Server For Team 3's Chinese Checkers Project
var express = require("express");
var app = express();
var port = 11657;
var players = new Array();

app.use("/", express.static(__dirname));

var io = require('socket.io').listen(app.listen(port));

// Tells socket.io to listen to an event called 'connection'.
// This is a built-in event that is triggered when a client connects to the
// server. At that time, the function (the 2nd argument) will be called with an
// object representing the client.
io.sockets.on(
	'connection',
	function(client) {
		// Send a welcome message first.
		client.emit('welcome', 'Welcome to my Chinese Checkers!');

		// Listen to an event called 'login'. The client should emit this event when
		// it wants to log in to the chat room.
		client.on(
			'login',
			function(message) {
				// This function extracts the user name from the login message, stores
				// it to the client object, sends a login_ok message to the client
				if (message && message.user_name) {
					players.push(client);
					client.set('user_name', message.user_name);
					client.emit('login_ok');
				
					//When there are 2 Clients Waiting, start a game
					if(players.length%2 == 0) {
						players[players.length-1].emit('start_game', "your_turn");
						players[players.length-2].emit('start_game', "opponents_turn");
					}
					return;
				}
				// When something is wrong, send a login_failed message to the client.
				client.emit('login_failed');
			});

	  
	// Listen to an event called 'move'. The client should emit this event when
	// it has moved a marble and then the server will pass it on to the other clients
	client.on(
    'move',
    function(startX, startY, endX, endY) {
        client.broadcast.emit('move', startX, startY, endX, endY);
    });
	
	// Listen to an event called 'win'. The client should emit this event when
	// it has won and then the server will pass it on to the other clients
	client.on(
    'win',
    function(startX, startY, endX, endY) {
        client.broadcast.emit('win', client.user_name);
    });
});

