	
SERVER.JS
		One of the first things needed for this project was a server that could communicate to the client and all other clients playing the game. 
		This was done using socket.io and a node.js. The source code file that contains the server is the file server.js. 
		The server receives signals from the clients when: The client connects, logs in, makes a move, or wins. There server sends signals to clients to:
		confirm connections, confirm log-in, communicate a log-in failure, communicate that the game has started, communicate that a move was received, confirm a win,
		inform the client that another client has won it's game, and inform a client of another clients move. The server is also responsible for matching clients into
		a game based on choosen settings. The server is also responsible for keeping track of which all games and which clients are in which games.
		
CLIENT.JS
       The client portion of the communication is held in the file client.js. This file contains the actual functionality of the game. It has the pieces,
	   the board, etc. It communicates to the server when it does such things as move and log in and receives messages from the server. When it receives
	   messages from the server it performs some function correlated with that message or signal. The easiest example to give is when the server sends a 
	   move message it updates the player’s board with the other player’s move. It can also send a win signal which in turn causes the server to send a 
	   message to the rest of the clients that are playing.
	   
INDEX.HTML
		This file, index.html, contains the graphical portion of the game. It’s where all the sections for different screens are held. For example, this lays 
		out the login screen with a name box, dropdown selector, and play button. In this file you will also see the different sizes of the screen and what 
		colour background it will have. In the future this file will be used more to modify fonts, texts, and colours to make the game more aesthetically pleasing. 
		One of the most important parts of the game held for this file is the game engine files being included basically into the game. Without the game engine 
		files parts of the game would have been much harder to implement. 
