//Server For Team 3's Chinese Checkers Project
var express = require("express");
var app = express();
var port = 22225;

//This Matrix holds all the players waiting to get into a game. The players are sorted into the Matrix by the number of players 
// that they want to be in a game with. If they are looking for Any, then they are in the first row, if they are looking for 2 
// then they are in the second row and so on...
var waitingPlayers = new Array(7);
for(var i = 0; i<7; i++) {
    
	waitingPlayers[i] = new Array();
    
} // end for loop

app.use("/", express.static(__dirname));

var io = require('socket.io').listen(app.listen(port));

var droppedClient = [];


//Helper Function to match players with simular settings
function findPlayersForGame() {
    
	var players = [ ]
	
	for(var numPlayers = 6; numPlayers > 0; numPlayers--) {
        players = [ ];
		
		if(numPlayers == 5) {
            
			numPlayers--;
            
        } // end if statement
	
		if(numPlayers == 1) {
            
			if(waitingPlayers[1].length >= 3) {
                
				for(var i = 0; i<3; i++) {
                    
					players = waitingPlayers[1].pop();
                    
                } // end for loop i
                
            } // end if statement
            
		} else if(waitingPlayers[numPlayers].length + waitingPlayers[1].length >= numPlayers) { //If we have enough to make a game of numPlayers size
            
			players = waitingPlayers[numPlayers].concat(waitingPlayers[1]);
			waitingPlayers[1] = [ ];
			waitingPlayers[numPlayers] = [ ];
            
		} // end if else statement
		
		var timedPlayers = new Array();
		var notTimedPlayers = new Array();
		
		for(var i = 0; i<players.length;i++) {
			if(players[i].timerSetting == 1 || players[i].timerSetting == 2)
				timedPlayers.push(players[i]);
			if(players[i].timerSetting == 1 || players[i].timerSetting == 3)
				notTimedPlayers.push(players[i]);
		}
		
		if(timedPlayers && timedPlayers.length >= numPlayers && timedPlayers.length != 1)
			return timedPlayers;
		else if(notTimedPlayers && notTimedPlayers.length >= numPlayers && timedPlayers.length != 1)
			return notTimedPlayers;
        
	} // end for loop numPlayers
	
	return [ ];
} // end function findPlayersForGame()

//Helper Function to find board position of the person who is moving given numPlayers and relativePosition to client
/*function getBoardPosition(relativePosition, numPlayers) {
	if(numPlayers == 6)
		return relativePosition;
	
	if(numPlayers == 4) {
		if(relativePosition == 1)
			return 2;
		else if(relativePosition == 2)
			return 3
		else if(relativePosition == 3)
			return 5;
	}
	
	if(numPlayers == 3)
		return relativePosition*2
		
	if(numPlayers == 2)
		return 3;
}*/

/*function hasDropped(playerName) {
  for(int i = 0; i < droppedClient.length; i++) {
    if(playerName == droppedClient[i]) {
      return true;
    }
  }
  
  return false;
}*/


// Tells socket.io to listen to an event called 'connection'.
// This is a built-in event that is triggered when a client connects to the
// server. At that time, the function (the 2nd argument) will be called with an
// object representing the client.
io.sockets.on(
	'connection',
	function(client) {
              
		// Send a welcome message first.
		client.emit('welcome', 'Chinese Checkers');

		// Listen to an event called 'login'. The client should emit this event when
		// it wants to log in to the chat room.
		client.on(
			'login',
			function(name, numPlayers, timerSetting) {
                  
                  
				// This function extracts the user name from the login message, stores
				// it to the client object, sends a login_ok message to the client
				if (name != null) {
					waitingPlayers[numPlayers].push(client);
					client.user_name = name;
					client.numPlayers = numPlayers;
					client.timerSetting = timerSetting;
					client.otherPlayers = [ ];
          
          client.emit('login_ok');
          
					var playersInGame = findPlayersForGame();
					if(playersInGame != null && playersInGame.length > 1) {
					
						var playerNames = [ ];
						for(var i = 0; i<playersInGame.length; i++) {
							playerNames.push(playersInGame[i].user_name);
						}
					
						for(var i = 0; i<playersInGame.length; i++) {
              client.myTurnOrder = i;
                  
              if(i == playersInGame.length-1) {
    
                playersInGame[i].next = playersInGame[0];
    
              } else {
    
                playersInGame[i].next = playersInGame[i+1];
              }
                
              if(i == 0)
								playersInGame[i].prev = playersInGame[playersInGame.length-1];
							else
								playersInGame[i].prev = playersInGame[i-1];
							
							
              if(i == 0) {
    
                playersInGame[i].emit('start_game', "Your Turn!", playersInGame.length, i, playersInGame[0].timerSetting, playerNames);
    
              } else {
    
                playersInGame[i].emit('start_game', playersInGame[0].user_name + "'s Turn.", playersInGame.length, i, playersInGame[0].timerSetting, playerNames);
    
              } // end if else statement
                  
							for (var j = 0; j<playersInGame.length; j++) {
                  
								if(i != j)
									playersInGame[i].otherPlayers.push(playersInGame[j]);
                  
							} // end for loop j
                  
						} // end for loop i
                  
					} // end if statement
					
					return;
                  
                  } // end if statement
				// When something is wrong, send a login_failed message to the client.
				client.emit('login_failed');
                  
			}); // end client login

	  
	// Listen to an event called 'move'. The client should emit this event when
	// it has moved a marble and then the server will pass it on to the other clients
	client.on(
    'move',
    function(startX, startY, endX, endY) {
		
	
    /*var originalClient = client;
  
    while(hasDropped(client.next.user_name)) {
      client = client.next;
    }*/
  
		for(var i = 0; i< client.otherPlayers.length; i++) {
		
			/*var iterator = client.otherPlayers[i].next;
			var relativePositionOfMover = 1;
			while(iterator != client) {
				relativePositionOfMover++;
				iterator = iterator.next;
			}
			
			var boardPosition = getBoardPosition(relativePositionOfMover, client.otherPlayers.length+1);*/
		  
      
        if(client.otherPlayers[i] == client.next) {
              
				  client.otherPlayers[i].emit('move', startX, startY, endX, endY, "Your Turn!");
              
        } else {
              
				  client.otherPlayers[i].emit('move', startX, startY, endX, endY, client.next.user_name + "'s Turn.");
        }
		}
    client.emit('you_moved', client.next.user_name + "'s Turn.");
    });
	
	// Listen to an event called 'win'. The client should emit this event when
	// it has won and then the server will pass it on to the other clients
	client.on(
    'win',
    function(startX, startY, endX, endY) {
              
		client.emit('you_win');
		for(var i = 0; i<client.otherPlayers.length; i++) {
              
			client.otherPlayers[i].emit('win', client.user_name);
		}
    });
    
  client.on(
    'chat',
    function(message) {
      var name = client.user_name;
      
      client.emit('chat', { user_name: name, msg: message });
		for(var i = 0; i<client.otherPlayers.length; i++) {
			client.otherPlayers[i].emit('chat', { user_name: name, msg: message });
		}
  });
  
  client.on(
    'dropped',
    function(player) {
      //droppedClient.push(client.user_name);
      var previousClient = client.prev;
      previousClient.next = client.next;
      client.next.prev = previousClient;
      //io.sockets.emit('chat', {user_name: 'debug', msg: "Previous: " + previousClient.user_name + " Next: " + client.next + " Previous.Next: " + previousClient.next});
      client.emit('dropped', player, client.myTurnOrder);
		for(var i = 0; i<client.otherPlayers.length; i++) {
			client.otherPlayers[i].emit('dropped', player, client.myTurnOrder);
		}
  });
});
