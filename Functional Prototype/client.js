var socket;
	var canvas, stage, canvasHold;

	var mouseTarget;	// the display object currently under the mouse, or being dragged
	var dragStarted;	// indicates whether we are currently in a drag operation
	var offset;
	var update = true;
	var spotMatrix = [];
	var othersMarbles = [];
	var myMarbles = [];
	var moveingFrom = [];
	var myTurn = true;
	var turnTracker = new createjs.Text("Your Turn!", "20px Arial", "#ff7700");
	
	var spotsInitialized = false;
	var playersInitialized = 0;
	
	var spotContainer = new createjs.Container();
	var myMarblesContainer = new createjs.Container();
	var othersMarblesContainer = new createjs.Container();
	
	// Declare Marble Images
	var redMarbleImage;
	var blueMarbleImage;
	var orangeMarbleImage; 
	var greenMarbleImage; 
	var yellowMarbleImage; 
	var purpleMarbleImage; 
		
	
	
  // $(document) returns a jQuery object representing the whole document (page).
  // $(document).ready(fn) tells jQuery to call function 'fn' after the whole
  // document is loaded.
  $(document).ready(function() {
    // Hide the warning section and show the login section.
    $('#warning').css('display', 'none');
	  $('#game_section').css('display', 'none');
	  $('#waiting_section').css('display', 'none');
    $('#login_section').css('display', 'block');

    // Initialize socket.io.
    // document.location.host returns the host of the current page.
    socket = io.connect('http://' + document.location.host);

    // If a welcome message is received from server, display welcome message and
    // the Log In button will be then enabled.
    socket.on(
      'welcome',
      function(message) {
        $('#status').text(message);
        $('#login').attr('disabled', false);
      });

    // If a login_ok message is received, proceed to the waiting section.
    socket.on(
      'login_ok',
      function() {
        $('#login_section').css('display', 'none');
        $('#waiting_section').css('display', 'block');
        $('#status').text('Waiting.');
      });
	  
	// If receive a start_game message from the server do this: Proceed to game
    socket.on(
      'start_game',
      function(turn, numPlayers, myTurnOrder) {
        $('#waiting_section').css('display', 'none');
        $('#game_section').css('display', 'block');
        $('#chat_section').css('display', 'block');
        $('#status').text('Playing.');
		
		loadMarbles(numPlayers, myTurnOrder)
		
		if(turn == "Your Turn!")
		{
			turnTracker.text = "Your Turn!";
			myTurn = true;
			update = true;
		}
		else
		{
			turnTracker.text = turn;
			myTurn = false;
			update = true;
		}
      });

    // If a login_failed message is received, stay in the login section but
    // display an error message.
    socket.on(
      'login_failed',
      function() {
        $('#status').text('Failed to log in!');
      });

	  
	// If server tells us that the other player moves do this:
    socket.on(
		'move',
		function(startX, startY, endX, endY, turn) 
		{
			/*var convertedStartSpot = convertSpot(startX, startY, boardPosition);
			var convertedEndSpot = convertSpot(endX, endY, boardPosition);*/
			
			/*var convertedStartSpot = convertSpot(startX, startY, boardPosition);
			var convertedEndSpot = convertSpot(endX, endY, boardPosition);*/
			
			var startSpot = spotMatrix[startY][startX];
			var endSpot = spotMatrix[endY][endX];
			
			startSpot.isEmpty = true;
			endSpot.isEmpty = false;
			
			var marble = findClosestOpponentMarble(startSpot.screenX, startSpot.screenY);
			marble.x = endSpot.screenX;
			marble.y = endSpot.screenY;
			
			if(turn == "Your Turn!")
			{
				turnTracker.text = "Your Turn!";
				myTurn = true;
				update = true;
			}
			else
			{
				turnTracker.text = turn;
				myTurn = false;
				update = true;
			}
		});
		
	// If server responds to our move, update turn status
    socket.on(
		'you_moved',
		function(turn) {
			turnTracker.text = turn;
			myTurn = false;
			update = true;
		});
		
	// If server responds to our move, update turn status
    socket.on(
		'you_win',
		function(turn) {
			turnTracker.text = "You Win!";
			myTurn = false;
			update = true;
		});
		
	// If server tells us that the other player has won:
    socket.on(
      'win',
      function(winner) {
			update = true;
			
			turnTracker.text = "Game Over! You Lose! " + winner + " wins!";
			myTurn = false;
        });

    socket.on(
      'chat',
      function(message) {
        //if (message && message.user_name && message.msg) {
          var user_name = message.user_name;
          var msg = message.msg;
          // This will create a div element using the HTML code:
          var div = $('<div></div>');
          // Similarly, create span elements with CSS classes and corresponding
          // contents, and append them in a row to the new div element.
          div.append($('<span></span>').addClass('user_name').text(user_name));
          div.append($('<span></span>').addClass('says').text(' says: '));
          div.append($('<span></span>').addClass('msg').text(msg));
          // Add the new div element to the chat board.
          $('#board').append(div);
          update = true;
        //}
      });

    // If a notification is received, display it.
    socket.on(
      'notification',
      function(message) {
        if (message) {
          // Similar to the handler of 'chat' event ...
          var div = $('<div></div>');
          div.append($('<span></span>').addClass('notification').text(message));
          $('#board').append(div);
          update = true;
        }
      });
        
    // When the Log In button is clicked, the provided function will be called,
    // which sends a login message to the server.
    $('#login').click(function() {
      var name = $('#name').val();
	    var numPlayers = $('#numPlayers').val();
      if (name) {
        name = name.trim();
        if (name.length > 0) {
          socket.emit('login', name, numPlayers);
        }
      }
      // Clear the input field.
      $('#name').val('');
    });

    $('#send').click(function() {
      var data = $('#msg').val();
      if (data) {
        data = data.trim();
        if (data.length > 0) {
          socket.emit('chat', data);
        }
      }
      // Clear the input field.
      $('#msg').val('');
    });
    
    $('#msg').keyup(function(event) {
      if (event.keyCode == 13) {
        $('#send').click();
      }
    });
    
    // When Enter is pressed in the name field, it should be treated as clicking
    // on the Log In button.
    $('#name').keyup(function(event) {
      if (event.keyCode == 13) {
        $('#login').click();
      }
    });

  });
	
	
	//Called to initialize the board when a client connects
	function init() {
		if (window.top != window) {
			document.getElementById("header").style.display = "none";
		}
		document.getElementById("loader").className = "loader";
		// create stage and point it to the canvas:
		canvas = document.getElementById("testCanvas");

		//check to see if we are running in a browser with touch support
		stage = new createjs.Stage(canvas);

		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(stage);

		// enabled mouse over / out events
		stage.enableMouseOver(10);
		stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
		
		//Load grey spot image
		var spotImage = new Image();
		spotImage.src = "assets/spot.png";
		spotImage.onload = handleSpotImageLoad;
		
		// load the red marble image:
		redMarbleImage = new Image();
		redMarbleImage.src = "assets/Rmarble.png"; 
		// load the my blue marble image image:
		blueMarbleImage = new Image();
		blueMarbleImage.src = "assets/Bmarble.png"; 
		// load the orange marble image:
		orangeMarbleImage = new Image(); 
		orangeMarbleImage.src = "assets/Omarble.png"; 
		// load the green marble image:
		greenMarbleImage = new Image(); 
		greenMarbleImage.src = "assets/Gmarble.png"; 
		// load the yellow marble image:
		yellowMarbleImage = new Image(); 
		yellowMarbleImage.src = "assets/Ymarble.png"; 
		// load the purple marble image: 
		purpleMarbleImage = new Image(); 
		purpleMarbleImage.src = "assets/Pmarble.png"; 
		
		stage.addChild(spotContainer);
		stage.addChild(othersMarblesContainer);
		stage.addChild(myMarblesContainer);
	}
	
	function getMyBoardPosition(numPlayers, myTurnOrder) {
		if(numPlayers == 2) {
			return myTurnOrder*3;
		}
		else if(numPlayers == 3) {
			return myTurnOrder*2
		}
		else if(numPlayers == 4) {
			if(myTurnOrder == 0)
				return 0;
			else if(myTurnOrder == 1)
				return 2;
			else if(myTurnOrder == 2)
				return 3;
			else if(myTurnOrder == 3)
				return 5;
		}
		else if(numPlayers ==  6) {
			return myTurnOrder;
		}
	}
	
	function getOthersBoardPositions(numPlayers, myBoardPosition) {
		if(numPlayers == 2) {
			if(myBoardPosition == 0)
				return [3];
			else if(myBoardPosition == 3)
				return [0];
		}
		else if(numPlayers == 3) {
			if(myBoardPosition == 0)
				return [2, 4];
			else if(myBoardPosition == 2)
				return [0, 4];
			else if(myBoardPosition == 4)
				return [0, 2];
		}
		else if(numPlayers == 4) {
			if(myBoardPosition == 0)
				return [2, 3, 5];
			else if(myBoardPosition == 2)
				return [0, 3, 5];
			else if(myBoardPosition == 3)
				return [0, 2, 5];
			else if(myBoardPosition == 5)
				return [0, 2, 3];
		}
		else if(numPlayers ==  6) {
			var positions = [0, 1, 2, 3, 4, 5];
			if(myBoardPosition == 0)
				return [1, 2, 3, 4, 5];
			else if(myBoardPosition == 1)
				return [0, 2, 3, 4, 5];
			else if(myBoardPosition == 2)
				return [0, 1, 3, 4, 5];
			else if(myBoardPosition == 3)
				return [0, 1, 2, 4, 5];
			else if(myBoardPosition == 4)
				return [0, 1, 2, 3, 5];
			else if(myBoardPosition == 5)
				return [0, 1, 2, 3, 4];
		}
	}
	
	function loadMarbles(numPlayers, myTurnOrder) {
		othersMarbles = [ ];
		
		var myBoardPosition = getMyBoardPosition(numPlayers, myTurnOrder);
		var othersBoardPositions = getOthersBoardPositions(numPlayers, myBoardPosition);
		
		if(numPlayers >= 2) {
      handleMyMarbleImageLoad(myBoardPosition);
			handleOthersMarlbleImageLoad(othersBoardPositions[0]);
		}
    
		if(numPlayers >= 3) {
			handleOthersMarlbleImageLoad(othersBoardPositions[1]);
		}
    
		if(numPlayers >= 4) {
			handleOthersMarlbleImageLoad(othersBoardPositions[2]);
		}
    
		if(numPlayers == 6) {
			handleOthersMarlbleImageLoad(othersBoardPositions[3]);
			handleOthersMarlbleImageLoad(othersBoardPositions[4]);
		}
	}

	function stop() {
		createjs.Ticker.removeEventListener("tick", tick);
	}
	
	//Converts from 1 spot to another to account for each player haveing own board orientation
	/*function convertSpot(x, y, boardPosition) {
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];
		var spotToConvert = findClosestSpot(x, y);
	  
		if(boardPosition >= 3) {
			var convertedStartX = startX + 2*((spotsPerLine[startY]-1)/2 - startX);
			var convertedStartY = startY + 2*(8-startY);
			var convertedEndX = endX + 2*((spotsPerLine[endY]-1)/2 - endX);
			var convertedEndY = endY + 2*(8-endY);
			
			var convertedStartSpot = spotMatrix[convertedStartY][convertedStartX];
			var convertedEndSpot = spotMatrix[convertedEndY][convertedEndX];
		}
		else if(boardPosition == 2) {
			var originizedScreenX = spotToConvert.screenX - 275;
			var originizedScreenY = 600-spotToConvert.screenY;
			
			//Using Equation Found Here:http://en.wikipedia.org/wiki/Reflection_(mathematics) For Reflextion Across a Line in a Plane
			var numerator = (originizedScreenX*525) + (originizedScreenY*350);
			var denominator = (525*525) + (350*350);
			
			var convertedScreenX = (2*(numerator/denominator)*(525)) - originizedScreenX;
			var convertedScreenY = (2*(numerator/denominator)*(350)) - originizedScreenY;
			
			return findClosestSpot(convertedScreenX, convertedScreenY);
		}
	}*/
	
	//Finds closes opponent marble to screen-pixel coordinates
	function findClosestOpponentMarble(screenX, screenY) {
		var shortestDistance = 10000;
		var closest;
	
		for(var i = 0; i<othersMarbles.length; i++) {
			var distance = Math.sqrt(((screenX - othersMarbles[i].x)*(screenX - othersMarbles[i].x)) + 
							((screenY - othersMarbles[i].y)*(screenY - othersMarbles[i].y)));
			if(distance < shortestDistance) {
				shortestDistance = distance;
				closest = othersMarbles[i];
			}
		}
		return closest;
	}
	
	//Finds closest spot to screen-pixel coordinates
	function findClosestSpot(screenX, screenY) {
		if(!spotsInitialized)
			return null;
		
		var shortestDistance = 10000;
		var closest;
	
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];
	
		for(var y = 0; y<17; y++) {
			for(var x = 0; x<spotsPerLine[y]; x++) {

				var distance = Math.sqrt(((screenX - spotMatrix[y][x].screenX)*(screenX - spotMatrix[y][x].screenX)) + 
								((screenY - spotMatrix[y][x].screenY)*(screenY - spotMatrix[y][x].screenY)));
				if(distance < shortestDistance) {
					shortestDistance = distance;
					closest = spotMatrix[y][x];
				}
			}
		}
		
		return closest;
	}
	
	//Takes a start spot and recursively finds all possible move locations
	function getValidMoves(possible, startSpot, cameFrom) {
		var possibleMoves = possible;
		var alreadyThere = false; 
		for (var i = 0; i < possibleMoves.length; i++) { 
			if (possibleMoves[i] == startSpot) { 
				return possibleMoves; 
			} 
		} // end for loop 
		
		possibleMoves.push(startSpot);
		
		//Check if can continue jumping to the northeast
		if(cameFrom != "northeast" 
			&& startSpot.northeast != null 
			&& !startSpot.northeast.isEmpty 
			&& startSpot.northeast.northeast != null 
			&& startSpot.northeast.northeast.isEmpty) {
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.northeast.northeast, "southwest") );
		}
		//Check if can continue jumping to the east
		if(cameFrom != "east" 
			&& startSpot.east != null 
			&& !startSpot.east.isEmpty 
			&& startSpot.east.east != null 
			&& startSpot.east.east.isEmpty) {
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.east.east, "west") );
		}
		//Check if can continue jumping to the southeast
		if(cameFrom != "southeast" 
			&& startSpot.southeast != null 
			&& !startSpot.southeast.isEmpty 
			&& startSpot.southeast.southeast != null 
			&& startSpot.southeast.southeast.isEmpty) {
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.southeast.southeast, "northwest") );
		}
		//Check if can continue jumping to the southwest
		if(cameFrom != "southwest" 
			&& startSpot.southwest != null 
			&& !startSpot.southwest.isEmpty 
			&& startSpot.southwest.southwest != null 
			&& startSpot.southwest.southwest.isEmpty) {
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.southwest.southwest, "northeast") );
		}
		//Check if can continue jumping to the west
		if(cameFrom != "west" 
			&& startSpot.west != null 
			&& !startSpot.west.isEmpty 
			&& startSpot.west.west != null 
			&& startSpot.west.west.isEmpty) {
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.west.west, "east") );
		}
		//Check if can continue jumping to the northwest
		if(cameFrom != "northwest" 
			&& startSpot.northwest != null 
			&& !startSpot.northwest.isEmpty 
			&& startSpot.northwest.northwest != null 
			&& startSpot.northwest.northwest.isEmpty) {
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.northwest.northwest, "southeast") );
		}
		
		return possibleMoves;
	}
	
	//checks the screen-pixel coordinates given to see if they are a valid move
	function isValidMove(startX, startY, endX, endY) {
		var start = findClosestSpot(startX, startY);
		var end = findClosestSpot(endX, endY);
		
		var possibleMoves = [ ];
		
		//Check if we can move or jump to the northeast
		if(start.northeast != null && start.northeast.isEmpty)
			possibleMoves.push(start.northeast);
		else if(start.northeast != null && start.northeast.northeast != null && start.northeast.northeast.isEmpty)
		{
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.northeast.northeast, "southwest") );
		}

		//Check if we can move or jump to the east
		if(start.east != null && start.east.isEmpty)
			possibleMoves.push(start.east);
		else if(start.east != null && start.east.east != null && start.east.east.isEmpty)
		{
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.east.east, "west") );
		}
		
		//Check if we can move or jump to the southeast
		if(start.southeast != null && start.southeast.isEmpty)
			possibleMoves.push(start.southeast);
		else if(start.southeast != null && start.southeast.southeast != null && start.southeast.southeast.isEmpty)
		{
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.southeast.southeast, "northwest") );
		}
		
		//Check if we can move or jump to the southwest
		if(start.southwest != null && start.southwest.isEmpty)
			possibleMoves.push(start.southwest);
		else if(start.southwest != null && start.southwest.southwest != null && start.southwest.southwest.isEmpty)
		{
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.southwest.southwest, "northeast") );
		}
		
		//Check if we can move or jump to the west
		if(start.west != null && start.west.isEmpty)
			possibleMoves.push(start.west);
		else if(start.west != null && start.west.west != null && start.west.west.isEmpty)
		{
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.west.west, "east") );
		}
		
		//Check if we can move or jump to the northwest
		if(start.northwest != null && start.northwest.isEmpty)
			possibleMoves.push(start.northwest);
		else if(start.northwest != null && start.northwest.northwest != null && start.northwest.northwest.isEmpty)
		{
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.northwest.northwest, "southeast") );
		}
		
		
		//Check list of possible moves to see if our end is in it
		if( possibleMoves.indexOf(end) > -1 )
			return true;
		else
			return false;
	}
	
	//Returns array of all neighbouring spots
	function getNeighboreSpots(spot) {
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];
		var neighbores = [];
	
		for(var y = 0; y < 17; y++){
			for(var x = 0; x < spotsPerLine[y]; x++){
				var distance = Math.sqrt(((spot.screenX - spotMatrix[y][x].screenX)*(spot.screenX - spotMatrix[y][x].screenX)) + 
								((spot.screenY - spotMatrix[y][x].screenY)*(spot.screenY - spotMatrix[y][x].screenY)));
				if(distance < 60 && (x!=spot.x || y!=spot.y))
					neighbores.push(spotMatrix[y][x]);
			}
		}
		
		return neighbores;
	}
	
	//Link spots to their neighbours which are legal moves
	function setUpSpotLinks() {
	
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];
	
		for(var y = 0; y < 17; y++){
			for(var x = 0; x < spotsPerLine[y]; x++){
				var neighbores = getNeighboreSpots(spotMatrix[y][x]);
				if(neighbores.length > 6 || neighbores.length < 2)
					console.debug("Linking Neighbores Length Error:" + neighbores.length);
				
				for(var i = 0; i<neighbores.length; i++) {
					if(neighbores[i].screenX > spotMatrix[y][x].screenX && neighbores[i].screenY < spotMatrix[y][x].screenY) { //Northeast
						spotMatrix[y][x].northeast = neighbores[i];
					}
					else if(neighbores[i].screenX > spotMatrix[y][x].screenX && neighbores[i].screenY == spotMatrix[y][x].screenY) { //East
						spotMatrix[y][x].east = neighbores[i];
					}
					else if(neighbores[i].screenX > spotMatrix[y][x].screenX && neighbores[i].screenY > spotMatrix[y][x].screenY) { //Southeast
						spotMatrix[y][x].southeast = neighbores[i];
					}
					else if(neighbores[i].screenX < spotMatrix[y][x].screenX && neighbores[i].screenY > spotMatrix[y][x].screenY) { //Southwest
						spotMatrix[y][x].southwest = neighbores[i];
					}
					else if(neighbores[i].screenX < spotMatrix[y][x].screenX && neighbores[i].screenY == spotMatrix[y][x].screenY) { //West
						spotMatrix[y][x].west = neighbores[i];
					}
					else if(neighbores[i].screenX < spotMatrix[y][x].screenX && neighbores[i].screenY < spotMatrix[y][x].screenY) { //Northwest
						spotMatrix[y][x].northwest = neighbores[i];
					}
					else
						console.debug("Spot Linking Error! No Direction For: From-(" + x + "," + y + ")  To-(" + neighbores[i].x + "," + neighbores[i].y + ")");
				}
			}
		}
	}
	
	//After the spots are initialized, go and mark the starting positions as occupied
	function markOccupiedSpots() {
		if(!spotsInitialized || playersInitialized < 2)
			return null;
	
		for(var i = 0; i<10; i++) {
			findClosestSpot(myMarbles[i].x, myMarbles[i].y).isEmpty = false;
			findClosestSpot(othersMarbles[i].x, othersMarbles[i].y).isEmpty = false;
		}
	}

	//Check to see if this client has won
	function hasWon() {
		for(var i = 0; i < 10; i++) {
			if( findClosestSpot(myMarbles[i].x, myMarbles[i].y).home != true )
				return false;
		}
		
		return true;
	}
	
	//Helper Function that marks the spots in a given position/corner as home for this client
	function markHomeSpots(position) {
		//list of positions coordinates
		var xPositions;
		var yPositions;
		
		if(position == 0) {
			xPositions = [425,475,525,575,450,500,550,475,525,500];
			yPositions = [700,700,700,700,750,750,750,800,800,850];
		}
		else if(position == 1) {
			xPositions = [350,300,250,200,325,275,225,300,250,275];
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		else if(position == 2) {
			xPositions = [350,300,250,200,325,275,225,300,250,275]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(position == 3) {
			xPositions = [500,475,525,450,500,550,425,475,525,575];
			yPositions = [50,100,100,150,150,150,200,200,200,200];
		}
		else if(position == 4) {
			xPositions = [800,750,700,650,775,725,675,750,700,725]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(position == 5) {
			xPositions = [800,750,700,650,775,725,675,750,700,725]; 
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		
		for(var i =0; i<10; i++) {
			var currentSpot = findClosestSpot(xPositions[i], yPositions[i]);
      currentSpot.home = true;
      //spotMatrix[currentSpot.y][currentSpot.x].
		}
	}
	
	//This function is called when the grey spot image is loaded. It positions the empty spots and initializes the matrix that holds them and the links between them
	function handleSpotImageLoad(event) {

		var image = event.target;
		var bitmap;
		
		//Set Up Turn Tracker Text
		turnTracker.x = 100; 
		turnTracker.y = 100; 
		turnTracker.textBaseline = "alphabetic";
		spotContainer.addChild(turnTracker);
			
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];

		// create and are position the grey spots
		for(var y = 0; y < 17; y++){
			spotMatrix[y] = new Array(spotsPerLine[y]);
			var startPointX = 500-(((spotsPerLine[y]-1)/2)*50);
			for(var x = 0; x < spotsPerLine[y]; x++){
				bitmap = new createjs.Bitmap(image);
				spotContainer.addChild(bitmap);
				bitmap.regX = bitmap.image.width/2|0;
				bitmap.regY = bitmap.image.height/2|0;
				bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.6;
				bitmap.x = startPointX;
				bitmap.y = (y+1)*50;
				bitmap.name = "spot_"+y+" "+x;
				
				spot = new Object();
				spot.isEmpty = true;
				spot.x = x;
				spot.y = y;
				spot.screenX = bitmap.x;
				spot.screenY = bitmap.y;
				spot.northeast = spot.east = spot.southeast = spot.southwest = spot.west = spot.northwest = null;
				spot.home = false;
				
				spotMatrix[y][x] = spot;
				
				startPointX += 50;
				
				/*if(y==11 && x==1)
					console.debug("Left Point: " + bitmap.x + "," + bitmap.y);
				if(y==4 && x==12)
					console.debug("Right Point: " + bitmap.x + "," + bitmap.y);*/
			}

			document.getElementById("loader").className = "";
			createjs.Ticker.addEventListener("tick", tick);
		}
		
		setUpSpotLinks();
		spotsInitialized = true;
		markOccupiedSpots();
	}
	
	//This function is run when the blue marble image is loaded and positions the blue marbles (this players marbles)
	function handleMyMarbleImageLoad(boardPosition) {
		myMarbles = new Array(10);
		var image;
		var bitmap;

		//list of starting positions
		var xPositions;
		var yPositions;
		
		if(boardPosition == 0) {
      image = blueMarbleImage;
			xPositions = [425,475,525,575,450,500,550,475,525,500];
			yPositions = [700,700,700,700,750,750,750,800,800,850];
		}
		else if(boardPosition == 1) {
      image = redMarbleImage;
			xPositions = [350,300,250,200,325,275,225,300,250,275];
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		else if(boardPosition == 2) {
      image = greenMarbleImage;
			xPositions = [350,300,250,200,325,275,225,300,250,275]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(boardPosition == 3) {
      image = yellowMarbleImage;
			xPositions = [500,475,525,450,500,550,425,475,525,575];
			yPositions = [50,100,100,150,150,150,200,200,200,200];
		}
		else if(boardPosition == 4) {
      image = orangeMarbleImage;
			xPositions = [800,750,700,650,775,725,675,750,700,725]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(boardPosition == 5) {
      image = purpleMarbleImage;
			xPositions = [800,750,700,650,775,725,675,750,700,725]; 
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		else
			console.debug("Error! Bad Board Position:" + boardPosition);
		
		// Create marbles and initial settings/positions
		for(var i = 0; i < 10; i++){
			bitmap = new createjs.Bitmap(image);
			myMarblesContainer.addChild(bitmap);
			bitmap.x = xPositions[i];
			bitmap.y = yPositions[i];
			bitmap.regX = bitmap.image.width/2|0;
			bitmap.regY = bitmap.image.height/2|0;
			bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.55;
			bitmap.name = "myMarble"+i;
			bitmap.cursor = "pointer";

			//Mark occupied spots as not empty
			var mySpot = findClosestSpot(bitmap.x, bitmap.y);
			if(mySpot != null)
				mySpot.isEmpty = false;
			
			//Add listener for mousedown that when triggered will enlarge if not already and also take note of starting position
			//Add listener for mouseup that when triggered will check to see if it is in a valid position. If marble is in valid position
			// on the mouseup then it will be officially moved and the server will be notified
			bitmap.addEventListener("mousedown", function(evt) {
				evt.preventDefault();
				if(myTurn && evt.nativeEvent.button != 2) {
					// bump the target in front of its siblings:
					var o = evt.target;
					o.scaleX = o.scaleY = 0.65;
					o.parent.addChild(o);
					o.offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
					
					moveingFrom.screenX = o.x;
					moveingFrom.screenY = o.y;
				}
			});
			
			//Add Mouseup Listener To Drop Marbles
			bitmap.on("pressup", function(evt) {
					evt.preventDefault();
					if(myTurn) { 
						evt.preventDefault();
						var o = evt.target;
						o.scaleX = o.scaleY = 0.55;
						update = true;
						
						if(isValidMove(moveingFrom.screenX, moveingFrom.screenY, o.x, o.y))
						{
							evt.preventDefault();
							var startSpot = findClosestSpot(moveingFrom.screenX, moveingFrom.screenY);
							var endSpot = findClosestSpot(o.x, o.y);
							o.x = endSpot.screenX;
							o.y = endSpot.screenY;
							endSpot.isEmpty = false;
							startSpot.isEmpty = true;
							socket.emit('move', startSpot.x, startSpot.y, endSpot.x, endSpot.y);
							
							if(hasWon())
							{
								turnTracker.text = "You Win!"
								socket.emit('win');
							}
						}
						else //Not valid move. Move marble back to where it was
						{
							evt.preventDefault();
							o.x = moveingFrom.screenX;
							o.y = moveingFrom.screenY;
						}
					}
				});
			
			// the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
			bitmap.addEventListener("pressmove", function(evt) {
				evt.preventDefault();
				if(myTurn && evt.nativeEvent.button != 2) {
					evt.preventDefault();
					var o = evt.target;
					o.x = evt.stageX+ o.offset.x;
					o.y = evt.stageY+ o.offset.y;
					update = true;
				}
			});
			
			//Add listener for rollover to enlarge marble when it is hovered over
			bitmap.addEventListener("rollover", function(evt) {
				evt.preventDefault();
				if(myTurn) {
					var o = evt.target;
					o.scaleX = o.scaleY = 0.65;
					update = true;
				}
			});
			
			//Add listener for rollout to re-shrink marble when it is not hovered over
			bitmap.addEventListener("rollout", function(evt) {
				evt.preventDefault();
				if(myTurn) {
					var o = evt.target;
					o.scaleX = o.scaleY = o.scale;
					update = true;
				}
			});
			
			myMarbles[i] = bitmap;
		}
		
		markHomeSpots((boardPosition+3)%6);

		document.getElementById("loader").className = "";
		createjs.Ticker.addEventListener("tick", tick);
		playersInitialized++;
	}
	
	// This function is run when the purple marble image is loaded.
	function handleOthersMarlbleImageLoad(boardPosition) { 
		var bitmap;
		var image;
    
		//list of starting positions
		var xPositions;
		var yPositions;
		
		if(boardPosition == 0) {
      image = blueMarbleImage;
			xPositions = [425,475,525,575,450,500,550,475,525,500];
			yPositions = [700,700,700,700,750,750,750,800,800,850];
		}
		else if(boardPosition == 1) {
      image = redMarbleImage;
			xPositions = [350,300,250,200,325,275,225,300,250,275];
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		else if(boardPosition == 2) {
      image = greenMarbleImage;
			xPositions = [350,300,250,200,325,275,225,300,250,275]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(boardPosition == 3) {
      image = yellowMarbleImage;
			xPositions = [500,475,525,450,500,550,425,475,525,575];
			yPositions = [50,100,100,150,150,150,200,200,200,200];
		}
		else if(boardPosition == 4) {
      image = orangeMarbleImage;
			xPositions = [800,750,700,650,775,725,675,750,700,725]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(boardPosition == 5) {
      image = purpleMarbleImage;
			xPositions = [800,750,700,650,775,725,675,750,700,725]; 
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		
		for(var i = 0; i < 10; i++){
			//Set up the image settings
			bitmap = new createjs.Bitmap(image);
			othersMarblesContainer.addChild(bitmap);
			bitmap.x = xPositions[i];
			bitmap.y = yPositions[i];
			bitmap.regX = bitmap.image.width/2|0;
			bitmap.regY = bitmap.image.height/2|0;
			bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.55;
			bitmap.name = "otherMarble"+othersMarbles.length;
			bitmap.cursor = "pointer";
			
			othersMarbles.push(bitmap);
			
			//Mark occupied spots as not empty
			var mySpot = findClosestSpot(bitmap.x, bitmap.y);
			if(mySpot != null)
				mySpot.isEmpty = false;
		}

		document.getElementById("loader").className = "";
		createjs.Ticker.addEventListener("tick", tick);
		playersInitialized++;
	} 

	function tick(event) {
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		event.preventDefault();
		if (update) {
			event.preventDefault();
			update = false; // only update once
			stage.update(event);
		}
	}
	
	document.addEventListener("contextmenu", function(e) {
		e.preventDefault();
	}, false);
