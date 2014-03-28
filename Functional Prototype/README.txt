	
SERVER.JS
		One of the first things needed for this project was a server that could communicate to the client and all other clients playing the game. 
		This was done using socket.io and a node.js. The source code file that contains the server is the file server.js. 
		It does very simply things for example it receives messages such as when the user tries to log in and then sends a message back to the client
		telling it its waiting on other players until another signal is sent or received. Another aspect of the game it communicates to the clients is
		when a player moves. The player sends a move signal to the server, and the server sends a signal to all other clients in the game to update their
		board with the other player’s move. Again the server part of this server to client and vice versa messaging is in the filer server.js
		
CLIENT.JS
       The client portion of the communication is help in the file client.js. This file contains the actual functionality of the game. It has the pieces,
	   the board, etc. It communicates to the server when it does such things as move and log in and receives messages from the server. When it receives
	   messages from the server it performs some function correlated with that message or signal. The easiest example to give is when the server sends a 
	   move message it updates the player’s board with the other player’s move. It can also send a win signal which in turn causes the server to send a 
	   message to the rest of the clients that are playing.
INDEX.HTML
		This file, index.html, contains the graphical portion of the game. It’s where all the sections or different screens are held and also what text 
		should appear on each screen, if any. In this file you will also see the different sizes of the screen and what color background it will have. 
		The font size and number of buttons are held in this file as well. One of the more important parts of the game held for this file is the game 
		engine files being included basically into the game. Without the game engine files parts of the game would have been much harder to implement. 
