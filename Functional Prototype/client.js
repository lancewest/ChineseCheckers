    // variables
    var socket;
	var canvas, stage, canvasHold;

	var mouseTarget;	// the display object currently under the mouse, or being dragged
	var dragStarted;	// indicates whether we are currently in a drag operation
	var offset;
	var update = true;
	var spotMatrix = [];    // contains board spots
	var othersMarbles = []; // contains opponenet game pieces
	var myMarbles = [];     // contains your game pieces
	var moveingFrom = [];
	var myTurn = true;
	var turnTracker = new createjs.Text("Your Turn!", "28px Jing Jing", "#330000");
	var timersManager = [];
	var gameOver = false;
	
	var spotsInitialized = false;
	var playersInitialized = 0;

    // containers for player pieces and board
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
		
	var playerIdentifier = "unassigned";
    var numberOfPlayers;
	
	//sound
	var audioElement = document.createElement('audio');
	audioElement.setAttribute('src', 'assets/moveSound.wav');
	audioElement.setAttribute('preload', 'auto');
	audioElement.load();
	
	//Display Marbles
	var displayMarbles = [ ];
	
// $(document) returns a jQuery object representing the whole document (page).
// $(document).ready(fn) tells jQuery to call function 'fn' after the whole
// document is loaded.
$(document).ready(function() {
                  // Hide the warning section and show the login section.
                  $('#warning').css('display', 'none');
                  $('#game_section').css('display', 'none');
                  $('#waiting_section').css('display', 'none');
                  $('#login_section').css('display', 'block');
                  $('#chat_section').css('display', 'none');
                  $('#instructions_standard_section').css('display', 'none');
                  //$('#instructions_capture_section').css('display', 'none');
                  
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
		$('#instructions_standard').attr('disabled',false);
		//$('#instructions_capture').attr('disabled', false);
      }); // end socket.on for welcome

    // If a login_ok message is received, proceed to the waiting section.
    socket.on(
      'login_ok',
      function() {
        $('#login_section').css('display', 'none');
        $('#waiting_section').css('display', 'block');
        $('#status').text('Waiting.');
      }); // end socket.on for login_ok
	  
	// If receive a start_game message from the server do this: Proceed to game
    socket.on(
      'start_game',
      function(turn, numPlayers, myTurnOrder, timerOption, playerNames) {
		//Hide and show appropriate stuff
        $('#waiting_section').css('display', 'none');
        $('#game_section').css('display', 'block');
        $('#chat_section').css('display', 'block');
        $('#status').text('Playing.');
		
    	numberOfPlayers = numPlayers;
      loadMarbles(numPlayers, myTurnOrder);
      setInterval(function(){updateTimer()}, 100);
		
		//Initialize player list and timersManager
		timersManager.timers = new Array(numPlayers);
		timersManager.turnIndex = 0;
		
		if(timerOption == 2)
			timersManager.countDown = true;
		else
			timersManager.countDown = false;
		
		var timersContainer = new createjs.Container();
	
		for(var i = 0; i<numPlayers; i++)
		{
			var defaultTime = timersManager.countDown ? 120 : 0;
		
			timersManager.timers[i] = [ ];
      timersManager.timers[i].isMe = i == myTurnOrder;
			
			var timeInMinutes = Math.floor(defaultTime/60) +":0" + defaultTime%60;
			timersManager.timers[i].textElement = new createjs.Text(playerNames[i] + " - " + timeInMinutes, "30px Jing Jing", "#330000");
			timersManager.timers[i].textElement.x = 650;
			timersManager.timers[i].textElement.y = 30*i + 25;
			
			timersManager.timers[i].isNewTurn = timersManager.countDown;
			timersManager.timers[i].time = defaultTime;
      timersManager.timers[i].firstTurn = true;
			timersManager.timers[i].userName = playerNames[i];
			
			timersContainer.addChild(timersManager.timers[i].textElement);
		}
		
		stage.addChild(timersContainer);
		
		setInterval( function() { updateTimeManager(); }, 500 );
		
		
		//Initialize turnTracker
		if(turn == "Your Turn!") {
			socket.emit('showColor', playerIdentifier);
			turnTracker.text = "Your Turn!";
			myTurn = true;
			update = true;
              
		} else {
              
			turnTracker.text = turn;
			myTurn = false;
			update = true;
		} // end if else statment
              
      }); // end socket.on for start_game

    // If a login_failed message is received, stay in the login section but
    // display an error message.
    socket.on(
      'login_failed',
      function() {
        $('#status').text('Failed to log in!');
      }); // end socket.on for login_failed

	  
	// If server tells us that the other player moves do this:
    socket.on(
		'move',
		function(startX, startY, endX, endY, turn, currentColor) {
			/*var convertedStartSpot = convertSpot(startX, startY, boardPosition);
			var convertedEndSpot = convertSpot(endX, endY, boardPosition);*/
			
			/*var convertedStartSpot = convertSpot(startX, startY, boardPosition);
			var convertedEndSpot = convertSpot(endX, endY, boardPosition);*/
			
      if(startX != 0 || startY != 0 || endX != 0 || endY != 0) {
			  var startSpot = spotMatrix[startY][startX];
			  var endSpot = spotMatrix[endY][endX];
			
			  
			
			var marble = findClosestOpponentMarble(startSpot.screenX, startSpot.screenY);
			marble.parent.addChild(marble);
			stage.addChild(marble);
			marble.offset = {x:marble.x, y:marble.y};
			
			
			var distance = Math.sqrt(((startSpot.screenX - endSpot.screenX)*(startSpot.screenX - endSpot.screenX)) + 
							((startSpot.screenY - endSpot.screenY)*(startSpot.screenY - endSpot.screenY)));
			
			//If not a jump move no need to find path
			if(distance < 60) {
				var tween = createjs.Tween.get(marble).to({ "x": endSpot.screenX, "y": endSpot.screenY }, 750, createjs.Ease.cubicIn);
				tween.call(function() { audioElement.play(); });
			}
			else {
				var spotsVisited = new Array();
				getSpotsVistited(startSpot, endSpot, spotsVisited, 0, new Array());
				
				var tween = createjs.Tween.get(marble);
				
				for(var i = spotsVisited.length-2; i>=0; i--)
					tween.to({ "x": spotsVisited[i].screenX, "y": spotsVisited[i].screenY }, 600, createjs.Ease.cubicIn).call(function() { audioElement.play(); });
			}
			
			startSpot.isEmpty = true;
			endSpot.isEmpty = false;
              
			timersManager.turnIndex++;
			if(timersManager.turnIndex >= timersManager.timers.length)
				timersManager.turnIndex = 0;
																
			if(timersManager.countDown)
				timersManager.timers[timersManager.turnIndex].isNewTurn = true;
			}
      
			if(turn == "Your Turn!") {
				socket.emit('showColor', playerIdentifier);
				turnTracker.text = "Your Turn!";
				myTurn = true;
				update = true;
              
			} else {
              
				turnTracker.text = turn;
				myTurn = false;
				update = true;
              
			} // end if else statement
		}); // end socket.on for move
		
	// If server responds to our move, update turn status
    socket.on(
		'you_moved',
		function(turn, currentColor) {
			turnTracker.text = turn;
			myTurn = false;
			update = true;
		}); // end socket.on for you_moved
		
	// If server responds to our move, update turn status
    socket.on(
		'you_win',
		function(turn) {
			socket.emit('showColor', playerIdentifier);
			gameOver = true;
			turnTracker.text = "You Win!";
			myTurn = false;
			update = true;
		}); // end socket.on for you_win
		
	// If server tells us that the other player has won:
    socket.on(
      'win',
      function(winner, winColor) {
			update = true;
			gameOver = true;
			turnTracker.text = "You Lose! \n" + winner + " wins!";
			myTurn = false;
        }); // end socket.on for win

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
          div.append($('<span></span>').addClass('user_name').text(user_name + ': '));
          div.append($('<span></span>').addClass('msg').text(msg));
          // Add the new div element to the chat board.
          $('#board').append(div);
          var divide = document.getElementById('board');
          divide.scrollTop = divide.scrollHeight;
          //div.css("background-image","url('paper.jpg')");
          //$('#board').css("background-image","url('paper.jpg')");
          update = true;
        //}
      });
      
	 socket.on(
      'showColor',
      function(color) {
			displayMarbles.blue.visible = false;
			if(displayMarbles.red)
				displayMarbles.red.visible = false;
			if(displayMarbles.yellow)
				displayMarbles.yellow.visible = false;
			if(displayMarbles.orange)
				displayMarbles.orange.visible = false;
			if(displayMarbles.green)
				displayMarbles.green.visible = false;
			if(displayMarbles.purple)
				displayMarbles.purple.visible = false;
	  
			if(color == 'blue') 
				displayMarbles.blue.visible = true;
			else if(color == 'red')
				displayMarbles.red.visible = true;
			else if(color == 'yellow')
				displayMarbles.yellow.visible = true;
			else if(color == 'orange')
				displayMarbles.orange.visible = true;
			else if(color == 'green')
				displayMarbles.green.visible = true;
			else if(color == 'purple')
				displayMarbles.purple.visible = true;
      });
	  
      socket.on(
      'dropped',
      function(player, timerOrder) {
        timersManager.timers.splice(timerOrder, 1);
        if(timersManager.turnIndex == timerOrder)
          timersManager.turnIndex++;
        if(timersManager.turnIndex >= timersManager.timers.length)
          timersManager.turnIndex = 0;
      
        removePlayerMarbles(player);
        numberOfPlayers = numberOfPlayers - 1;
        if(numberOfPlayers == 1 && playerIdentifier != player) {
          socket.emit('win');
          gameOver = true;
          }
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
		var timerSetting = $('#timerOptions').val();
      if (name) {
        name = name.trim();
        if (name.length > 0) {
          socket.emit('login', name, numPlayers, timerSetting);
        } // end if statement
      } // end if statement
      // Clear the input field.
      $('#name').val('');
    }); // end #login

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
    
    $('#surrender').click(function() {
        $('#warning').css('display', 'none');
	    $('#game_section').css('display', 'none');
	    $('#waiting_section').css('display', 'none');
        $('#chat_section').css('display', 'none');
        $('#login_section').css('display', 'block');
        
        if(myTurn)
			socket.emit('move', 0, 0, 0, 0);
			
        socket.emit('dropped', playerIdentifier);
        
        location.reload(true);
    });
	
	$('#howToPlay').click(function() {
		window.open('InstructionsPopUp.html', this.target, 'width=1000, height=400');
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
      } // end if statement
    }); // end #name

	// If the instructions button is clicked then display instructions section and
	// hide the login section
	$('#instructions_standard').click(function() {
		 $('#login_section').css('display', 'none');
		 $('#instructions_standard_section').css('display', 'block');
		 $('#backtologin_standard').attr('disabled', false);
		 window.scrollBy(0,965);
	}); // end #instructions_standard
	
	// If the instructions for capture is clicked then display the rules and instructions
	// section for the game mode capture.
	//$('#instructions_capture').click(function() {
		//$('#login_section').css('display', 'none');
		//$('#instructions_capture_section').css('display', 'block');
		//$('#backtologin_capture').attr('disabled', false);
	//});
	
	// Once clicked goes back to the login section
	$('#backtologin_standard').click(function() {
		$('#instructions_standard_section').css('display', 'none');
		$('#login_section').css('display', 'block');
	}); // end #backtologin_standard
	
	// Once clicked goes back to the login section
	//$('#backtologin_capture').click(function() {
		//$('#instructions_capture_section').css('display', 'none');
		//$('#login_section').css('display', 'block');
	//});
  }); // end ready document
	
	
	//Used for timers
	function updateTimeManager() {
    if(gameOver)
      return;
  
		var timerToChange = timersManager.timers[timersManager.turnIndex];
    
		if(timersManager.countDown)
			timerToChange.time -= 0.5;
		else
			timerToChange.time += 0.5;
      
    if(timersManager.countDown && timerToChange.time <= 0) {
      timerToChange.textElement.text = timerToChange.userName + " - 0:00 - Out Of Time";
      update = true;
      timersManager.timers.splice(timersManager.turnIndex, 1);
      
      if(timersManager.turnIndex >= timersManager.timers.length)
        timersManager.turnIndex = 0;
        
      if(timerToChange.isMe) {
        socket.emit('move', 0, 0, 0, 0);
        socket.emit('dropped', playerIdentifier);
      }
    }
		
		var seconds = Math.floor(timerToChange.time%60) < 10 ? "0" + Math.floor(timerToChange.time%60) : Math.floor(timerToChange.time%60);
		var timeInMinutes = Math.floor(timerToChange.time/60) +":" + seconds;
    
		if(timerToChange.isNewTurn && !timerToChange.firstTurn) {
      timerToChange.time += 15;
			timeInMinutes = Math.floor(timerToChange.time/60) +":" + Math.floor(timerToChange.time%60) + "   +15 sec";
		}
		timerToChange.isNewTurn = false;
    timerToChange.firstTurn = false;
    
		timerToChange.textElement.text = timerToChange.userName + " - " + timeInMinutes;
		update = true;
		
	}
	
	//Called to initialize the board when a client connects
	function init() {
        
		if (window.top != window) {
			document.getElementById("header").style.display = "none";
		} // end if statement
        
		document.getElementById("loader").className = "loader";
		createjs.MotionGuidePlugin.install();
        
		// create stage and point it to the canvas:
		canvas = document.getElementById("testCanvas");

		//check to see if we are running in a browser with touch support
		stage = new createjs.Stage(canvas);
		
		//Set up background board outline
		var backgroundOutline = new createjs.Bitmap("assets/BoardOutline5.png");
		stage.addChild(backgroundOutline);

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
        
        stage.update();
	} // end function init()

    // gets your position on the board
	function getMyBoardPosition(numPlayers, myTurnOrder) {
        
		if(numPlayers == 2) {
            
			return myTurnOrder*3;
            
		} else if(numPlayers == 3) {
            
			return myTurnOrder*2
            
		} else if(numPlayers == 4) {
            
			if(myTurnOrder == 0)
				return 0;
			else if(myTurnOrder == 1)
				return 2;
			else if(myTurnOrder == 2)
				return 3;
			else if(myTurnOrder == 3)
				return 5;
            
		} else if(numPlayers ==  6) {
            
			return myTurnOrder;
            
		} // end if else statement
        
	} // end function getMyBoardPosition(numPlayers, myTurnOrder)

    // gets the other board positions based off your board position
	function getOthersBoardPositions(numPlayers, myBoardPosition) {
        
		if(numPlayers == 2) {
            
			if(myBoardPosition == 0)
				return [3];
			else if(myBoardPosition == 3)
				return [0];
            
		} else if(numPlayers == 3) {
            
			if(myBoardPosition == 0)
				return [2, 4];
			else if(myBoardPosition == 2)
				return [0, 4];
			else if(myBoardPosition == 4)
				return [0, 2];
            
		} else if(numPlayers == 4) {
            
			if(myBoardPosition == 0)
				return [2, 3, 5];
			else if(myBoardPosition == 2)
				return [0, 3, 5];
			else if(myBoardPosition == 3)
				return [0, 2, 5];
			else if(myBoardPosition == 5)
				return [0, 2, 3];
            
		} else if(numPlayers ==  6) {
            
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
            
		} // end if else statement
        
	} // end getOthersBoardPositions(numPlayers, myBoardPosition)

    // load player pieces ono screen
	function loadMarbles(numPlayers, myTurnOrder) {
        
		othersMarbles = [ ];
		
		var myBoardPosition = getMyBoardPosition(numPlayers, myTurnOrder);
    
    if     (myBoardPosition == 0) playerIdentifier = "blue";
    else if(myBoardPosition == 1) playerIdentifier = "red";
    else if(myBoardPosition == 2) playerIdentifier = "green";
    else if(myBoardPosition == 3) playerIdentifier = "yellow"
    else if(myBoardPosition == 4) playerIdentifier = "orange";
    else if(myBoardPosition == 5) playerIdentifier = "purple";
    
    
		var othersBoardPositions = getOthersBoardPositions(numPlayers, myBoardPosition);
		
		if(numPlayers >= 2) {
            
            handleMyMarbleImageLoad(myBoardPosition, playerIdentifier);
			handleOthersMarlbleImageLoad(othersBoardPositions[0]);
            
		} // end if statement
    
		if(numPlayers >= 3) {
            
			handleOthersMarlbleImageLoad(othersBoardPositions[1]);
            
		} // end if statement
    
		if(numPlayers >= 4) {
            
			handleOthersMarlbleImageLoad(othersBoardPositions[2]);
            
		} // end if statement
    
		if(numPlayers == 6) {
            
			handleOthersMarlbleImageLoad(othersBoardPositions[3]);
			handleOthersMarlbleImageLoad(othersBoardPositions[4]);
            
		} // end if statement
        
	} // end function loadMarbles(numPlayers, myTurnOrder)

    // stops the Ticker
	function stop() {
        
		createjs.Ticker.removeEventListener("tick", tick);
        
	} // end function stop()
	
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
                
			} // end if statement
            
		} // end for loop
        
		return closest;
        
	} // end function findClosestOpponentMarble
	
	//Finds closest spot to screen-pixel coordinates
	function findClosestSpot(screenX, screenY) {
        
		if(!spotsInitialized) {
            
			return null;
            
        } // end if statement
		
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
                    
				} // end if statement
                
			} // end for loop x
            
		} // end for loop y
		
		return closest;
        
	} // end function findClosestSpot(screenX, screenY)
	
	//Takes starting and end spot and returns a list of the path the marble took in order
	function getSpotsVistited(startSpot, endSpot, spotsVisited, depth, checkedList) {
		//Check to see if this is a wild goose chase path
		depth++;
		if(depth > 30)
			return false;
		
		//If we have allready checked this spot, return false to prevent looping
		for(var i = 0; i<checkedList.length; i++) {
			if(startSpot.x == checkedList[i].x && startSpot.y == checkedList[i].y) {
				checkedList.push(startSpot);
				return false;
			}
		}
		checkedList.push(startSpot);
		
	
		//If this is the end spot, add it and return true
		if(startSpot.x == endSpot.x && startSpot.y == endSpot.y) {
			spotsVisited.push(startSpot)
			return true;
		}

		//If one of the jump neighbours is the next step towards the finish, add and return true
		if(startSpot.northeast != null 
			&& !startSpot.northeast.isEmpty 
			&& startSpot.northeast.northeast != null 
			&& startSpot.northeast.northeast.isEmpty) {
				if(getSpotsVistited(startSpot.northeast.northeast, endSpot, spotsVisited, depth, checkedList)) {
					spotsVisited.push(startSpot);
					return true;
				}
		} // end if statement
        
		if(startSpot.east != null 
			&& !startSpot.east.isEmpty 
			&& startSpot.east.east != null 
			&& startSpot.east.east.isEmpty) {
				if(getSpotsVistited(startSpot.east.east, endSpot, spotsVisited, depth, checkedList)) {
					spotsVisited.push(startSpot);
					return true;
				}
		} // end if statement
        
		if(startSpot.southeast != null 
			&& !startSpot.southeast.isEmpty 
			&& startSpot.southeast.southeast != null 
			&& startSpot.southeast.southeast.isEmpty) {
				if(getSpotsVistited(startSpot.southeast.southeast, endSpot, spotsVisited, depth, checkedList)) {
					spotsVisited.push(startSpot);
					return true;
				}
		} // end if statement
        
		if(startSpot.southwest != null 
			&& !startSpot.southwest.isEmpty 
			&& startSpot.southwest.southwest != null 
			&& startSpot.southwest.southwest.isEmpty) {
				if(getSpotsVistited(startSpot.southwest.southwest, endSpot, spotsVisited, depth, checkedList)) {
					spotsVisited.push(startSpot);
					return true;
				}
		} // end if statement
        
		if(startSpot.west != null 
			&& !startSpot.west.isEmpty 
			&& startSpot.west.west != null 
			&& startSpot.west.west.isEmpty) {
				if(getSpotsVistited(startSpot.west.west, endSpot, spotsVisited, depth, checkedList)) {
					spotsVisited.push(startSpot);
					return true;
				}
		} // end if statement
        
		if(startSpot.northwest != null 
			&& !startSpot.northwest.isEmpty 
			&& startSpot.northwest.northwest != null 
			&& startSpot.northwest.northwest.isEmpty) {
				if(getSpotsVistited(startSpot.northwest.northwest, endSpot, spotsVisited, depth, checkedList)) {
					spotsVisited.push(startSpot);
					return true;
				}
		} // end if statement
		
		return false;
	}
	
	//Takes a start spot and recursively finds all possible move locations
	function getValidMoves(possible, startSpot, cameFrom) {
        
		var possibleMoves = possible;
		var alreadyThere = false; 
		for (var i = 0; i < possibleMoves.length; i++) {
            
			if (possibleMoves[i] == startSpot) {
                
				return possibleMoves;
                
			} // end if statement
            
		} // end for loop 
		
		possibleMoves.push(startSpot);
		
		//Check if can continue jumping to the northeast
		if(cameFrom != "northeast" 
			&& startSpot.northeast != null 
			&& !startSpot.northeast.isEmpty 
			&& startSpot.northeast.northeast != null 
			&& startSpot.northeast.northeast.isEmpty) {
            
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.northeast.northeast, "southwest") );
            
		} // end if statement
        
		//Check if can continue jumping to the east
		if(cameFrom != "east" 
			&& startSpot.east != null 
			&& !startSpot.east.isEmpty 
			&& startSpot.east.east != null 
			&& startSpot.east.east.isEmpty) {
            
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.east.east, "west") );
            
		} // end if statement
        
		//Check if can continue jumping to the southeast
		if(cameFrom != "southeast" 
			&& startSpot.southeast != null 
			&& !startSpot.southeast.isEmpty 
			&& startSpot.southeast.southeast != null 
			&& startSpot.southeast.southeast.isEmpty) {
            
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.southeast.southeast, "northwest") );
            
		} // end if statement
        
		//Check if can continue jumping to the southwest
		if(cameFrom != "southwest" 
			&& startSpot.southwest != null 
			&& !startSpot.southwest.isEmpty 
			&& startSpot.southwest.southwest != null 
			&& startSpot.southwest.southwest.isEmpty) {
            
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.southwest.southwest, "northeast") );
            
		} // end if statement
        
		//Check if can continue jumping to the west
		if(cameFrom != "west" 
			&& startSpot.west != null 
			&& !startSpot.west.isEmpty 
			&& startSpot.west.west != null 
			&& startSpot.west.west.isEmpty) {
            
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.west.west, "east") );
            
		} // end if statement
        
		//Check if can continue jumping to the northwest
		if(cameFrom != "northwest" 
			&& startSpot.northwest != null 
			&& !startSpot.northwest.isEmpty 
			&& startSpot.northwest.northwest != null 
			&& startSpot.northwest.northwest.isEmpty) {
            
				possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, startSpot.northwest.northwest, "southeast") );
            
		} // end if statement
		
		return possibleMoves;
        
	} // end getValidMoves(possible, startSpot, cameFrom)
	
	//checks the screen-pixel coordinates given to see if they are a valid move
	function isValidMove(startX, startY, endX, endY) {
        
		var start = findClosestSpot(startX, startY);
		var end = findClosestSpot(endX, endY);
		
		var possibleMoves = [ ];
		
		//Check if we can move or jump to the northeast
		if(start.northeast != null && start.northeast.isEmpty) {
            
			possibleMoves.push(start.northeast);
        
		} else if(start.northeast != null && start.northeast.northeast != null && start.northeast.northeast.isEmpty) {
            
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.northeast.northeast, "southwest") );
            
		} // end if else statement

		//Check if we can move or jump to the east
		if(start.east != null && start.east.isEmpty) {
            
			possibleMoves.push(start.east);
            
		} else if(start.east != null && start.east.east != null && start.east.east.isEmpty) {
            
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.east.east, "west") );
            
		} // end if else statement
		
		//Check if we can move or jump to the southeast
		if(start.southeast != null && start.southeast.isEmpty) {
            
			possibleMoves.push(start.southeast);
            
		} else if(start.southeast != null && start.southeast.southeast != null && start.southeast.southeast.isEmpty) {
            
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.southeast.southeast, "northwest") );
            
		} // end if else statement
		
		//Check if we can move or jump to the southwest
		if(start.southwest != null && start.southwest.isEmpty) {
            
			possibleMoves.push(start.southwest);
            
		} else if(start.southwest != null && start.southwest.southwest != null && start.southwest.southwest.isEmpty) {
            
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.southwest.southwest, "northeast") );
            
		} // end if else statement
		
		//Check if we can move or jump to the west
		if(start.west != null && start.west.isEmpty) {
            
			possibleMoves.push(start.west);
            
		} else if(start.west != null && start.west.west != null && start.west.west.isEmpty) {
            
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.west.west, "east") );
            
		} // end if else statement
		
		//Check if we can move or jump to the northwest
		if(start.northwest != null && start.northwest.isEmpty) {
            
			possibleMoves.push(start.northwest);
            
		} else if(start.northwest != null && start.northwest.northwest != null && start.northwest.northwest.isEmpty) {
            
			possibleMoves = possibleMoves.concat( getValidMoves(possibleMoves, start.northwest.northwest, "southeast") );
            
		} // end if else statement
		
		
		//Check list of possible moves to see if our end is in it
		if( possibleMoves.indexOf(end) > -1 ) {
			return true;
		} else {
			return false;
        } // end if else statement
        
	} // end isValidMove(startX, startY, endX, endY)

	//Returns array of all neighbouring spots
	function getNeighboreSpots(spot) {
        
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];
		var neighbores = [];
	
		for(var y = 0; y < 17; y++){
            
			for(var x = 0; x < spotsPerLine[y]; x++){
                
				var distance = Math.sqrt(((spot.screenX - spotMatrix[y][x].screenX)*(spot.screenX - spotMatrix[y][x].screenX)) + 
								((spot.screenY - spotMatrix[y][x].screenY)*(spot.screenY - spotMatrix[y][x].screenY)));
    
				if(distance < 60 && (x!=spot.x || y!=spot.y)) {
                    
					neighbores.push(spotMatrix[y][x]);
                    
                } // end if statement
                
			} // end for statement x
            
		} // end for statement y
		
		return neighbores;
        
	} // end getNeighnoreSpots(spot)
	
	//Link spots to their neighbours which are legal moves
	function setUpSpotLinks() {
	
		var spotsPerLine = [1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1];
	
		for(var y = 0; y < 17; y++){
            
			for(var x = 0; x < spotsPerLine[y]; x++){
                
				var neighbores = getNeighboreSpots(spotMatrix[y][x]);
				if(neighbores.length > 6 || neighbores.length < 2) {
                    
					console.debug("Linking Neighbores Length Error:" + neighbores.length);
                    
                } // end if statement
				
				for(var i = 0; i<neighbores.length; i++) {
                    
					if(neighbores[i].screenX > spotMatrix[y][x].screenX && neighbores[i].screenY < spotMatrix[y][x].screenY) { //Northeast
                        
						spotMatrix[y][x].northeast = neighbores[i];
                        
					} else if(neighbores[i].screenX > spotMatrix[y][x].screenX && neighbores[i].screenY == spotMatrix[y][x].screenY) { //East
                        
						spotMatrix[y][x].east = neighbores[i];
                        
					} else if(neighbores[i].screenX > spotMatrix[y][x].screenX && neighbores[i].screenY > spotMatrix[y][x].screenY) { //Southeast
                        
						spotMatrix[y][x].southeast = neighbores[i];
                        
					} else if(neighbores[i].screenX < spotMatrix[y][x].screenX && neighbores[i].screenY > spotMatrix[y][x].screenY) { //Southwest
                        
						spotMatrix[y][x].southwest = neighbores[i];
                        
					} else if(neighbores[i].screenX < spotMatrix[y][x].screenX && neighbores[i].screenY == spotMatrix[y][x].screenY) { //West
                        
						spotMatrix[y][x].west = neighbores[i];
                        
					} else if(neighbores[i].screenX < spotMatrix[y][x].screenX && neighbores[i].screenY < spotMatrix[y][x].screenY) { //Northwest
                        
						spotMatrix[y][x].northwest = neighbores[i];
                        
					} else {
                        
						console.debug("Spot Linking Error! No Direction For: From-(" + x + "," + y + ")  To-(" + neighbores[i].x + "," + neighbores[i].y + ")");
                        
                    } // end if else statement
                    
				} // end for loop i
                
			} // end for loop x
            
		} // end for loop y
        
	} // end function setUpSpotLinks()
	
	//After the spots are initialized, go and mark the starting positions as occupied
	function markOccupiedSpots() {
        
		if(!spotsInitialized || playersInitialized < 2) {
            
			return null;
        
        } // end if statement
	
		for(var i = 0; i<10; i++) {
            
			findClosestSpot(myMarbles[i].x, myMarbles[i].y).isEmpty = false;
			findClosestSpot(othersMarbles[i].x, othersMarbles[i].y).isEmpty = false;
            
		} // end for loop
        
	} // end markOccupiedSpots()

	//Check to see if this client has won
	function hasWon() {
        
		for(var i = 0; i < 10; i++) {
            
			if(findClosestSpot(myMarbles[i].x, myMarbles[i].y).home != true) {
                
				return false;
                
            } // end if statement
            
		} // end for loop
		
		return true;
        
	} // end hasWon()
	
	//Helper Function that marks the spots in a given position/corner as home for this client
	function markHomeSpots(position) {
        
		//list of positions coordinates
		var xPositions;
		var yPositions;
		
		if(position == 0) {
            
			xPositions = [418,473,528,583,445,500,555.5,473,528,500];
			yPositions = [700,700,700,700,750,750,750,800,800,850];
            
		} else if(position == 1) {
            
			xPositions = [335,280,225,170,308,253,198,280,225,252];
			yPositions = [650,650,650,650,600,600,600,550,550,500];
            
		} else if(position == 2) {
            
			xPositions = [335,280,225,170,306,254,199,280,225,252]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
            
		} else if(position == 3) {
            
			xPositions = [500,472,527,445,500,555,418,472,528,583];
			yPositions = [50,100,100,150,150,150,200,200,200,200];
            
		} else if(position == 4) {
            
			xPositions = [830,775,720,665,802,747,692,775,720,747]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
            
		} else if(position == 5) {
            
			xPositions = [830,775,720,665,802,747,693,775,720,747]; 
			yPositions = [650,650,650,650,600,600,600,550,550,500];
            
		} // end if statement
		
		for(var i =0; i<10; i++) {
            
			var currentSpot = findClosestSpot(xPositions[i], yPositions[i]);
            currentSpot.home = true;
            //spotMatrix[currentSpot.y][currentSpot.x].
            
		} // end for loop
        
	} // end function markHomeSpots(position)
	
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
			var startPointX = 500-(((spotsPerLine[y]-1)/2)*55);
            
			for(var x = 0; x < spotsPerLine[y]; x++){
                
				bitmap = new createjs.Bitmap(image);
				spotContainer.addChild(bitmap);
				bitmap.regX = bitmap.image.width/2|0;
				bitmap.regY = bitmap.image.height/2|0;
				bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.64;
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
				startPointX += 55;
				
				/*if(y==11 && x==1)
					console.debug("Left Point: " + bitmap.x + "," + bitmap.y);
				if(y==4 && x==12)
					console.debug("Right Point: " + bitmap.x + "," + bitmap.y);*/
                
			} // end for loop x

			document.getElementById("loader").className = "";
			createjs.Ticker.addEventListener("tick", tick);
            
		} // end for loop y
		
		setUpSpotLinks();
		spotsInitialized = true;
		markOccupiedSpots();
        
	} // end function handleSpotImageLoad(event)
	
	//This function is run when the blue marble image is loaded and positions the blue marbles (this players marbles)
	function handleMyMarbleImageLoad(boardPosition, color) {
        
		myMarbles = new Array(10);
		var image;
		var bitmap;

		//list of starting positions
		var xPositions;
		var yPositions;
		
		if(boardPosition == 0) {
            
			image = blueMarbleImage;
			xPositions = [418,473,528,583,445,500,555.5,473,528,500];
			yPositions = [700,700,700,700,750,750,750,800,800,850];
            
		} else if(boardPosition == 1) {
            
			image = redMarbleImage;
			xPositions = [335,280,225,170,308,253,198,280,225,252];
			yPositions = [650,650,650,650,600,600,600,550,550,500];
            
		} else if(boardPosition == 2) {
            
			image = greenMarbleImage;
			xPositions = [335,280,225,170,306,254,199,280,225,252]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
            
		} else if(boardPosition == 3) {
            
			image = yellowMarbleImage;
			xPositions = [500,472,527,445,500,555,418,472,528,583];
			yPositions = [50,100,100,150,150,150,200,200,200,200];
            
		} else if(boardPosition == 4) {
            
			image = orangeMarbleImage;
			xPositions = [830,775,720,665,802,747,692,775,720,747]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
            
		} else if(boardPosition == 5) {
            
			image = purpleMarbleImage;
			xPositions = [830,775,720,665,802,747,693,775,720,747]; 
			yPositions = [650,650,650,650,600,600,600,550,550,500];
            
		} else {
            
			console.debug("Error! Bad Board Position:" + boardPosition);
            
        } // end if else statement
		
		//Create Display Marble
		var displayBitmap = new createjs.Bitmap(image);
		
		if(color == 'blue')
			displayMarbles.blue = displayBitmap;
		else if(color == 'red')
			displayMarbles.red = displayBitmap;
		else if(color == 'green')
			displayMarbles.green = displayBitmap;
		else if(color == 'orange')
			displayMarbles.orange = displayBitmap;
		else if(color == 'purple')
			displayMarbles.purple = displayBitmap;
		else if(color == 'yellow')
			displayMarbles.yellow = displayBitmap;
			
		displayBitmap.x = 50;
		displayBitmap.y = 65;
		displayBitmap.scaleX = displayBitmap.scaleY = displayBitmap.scale = 0.55;
		myMarblesContainer.addChild(displayBitmap);
		
		// Create marbles and initial settings/positions
		for(var i = 0; i < 10; i++) {
            
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
				if(myTurn && evt.nativeEvent.button == 0) {
                                    
                                    
					// bump the target in front of its siblings:
					var o = evt.target;
					o.scaleX = o.scaleY = 0.65;
					o.parent.addChild(o);
					o.offset = {x:o.x-evt.stageX, y:o.y-evt.stageY};
					
					moveingFrom.screenX = o.x;
					moveingFrom.screenY = o.y;
                                    
				} // end if statement
                                    
			}); // end bitmap 'mousedown' listener
			
			//Add Mouseup Listener To Drop Marbles
			bitmap.on("pressup", function(evt) {
                      
					evt.preventDefault();
					if(myTurn) {
                      
						evt.preventDefault();
						var o = evt.target;
						o.scaleX = o.scaleY = 0.55;
						update = true;
						
                      if(isValidMove(moveingFrom.screenX, moveingFrom.screenY, o.x, o.y)) {
                      
							evt.preventDefault();
							var startSpot = findClosestSpot(moveingFrom.screenX, moveingFrom.screenY);
							var endSpot = findClosestSpot(o.x, o.y);
							o.x = endSpot.screenX;
							o.y = endSpot.screenY;
							endSpot.isEmpty = false;
							startSpot.isEmpty = true;
							audioElement.play();
							socket.emit('move', startSpot.x, startSpot.y, endSpot.x, endSpot.y);
							
							
							timersManager.turnIndex++;
							if(timersManager.turnIndex >= timersManager.timers.length)
								timersManager.turnIndex = 0;
																
							if(timersManager.countDown)
								timersManager.timers[timersManager.turnIndex].isNewTurn = true;
							
							
							
							if(hasWon()) {
								socket.emit('showColor', playerIdentifier);
								turnTracker.text = "You Win!"
								socket.emit('win');
                      
							} // end if statement
                      
                       } else { // Not valid move. Move marble back to where it was
						
							evt.preventDefault();
							o.x = moveingFrom.screenX;
							o.y = moveingFrom.screenY;
                      
                      } // end if else statement
                      
					} // end if statement
                      
				}); // end bitmap.on pressup function 
        
      bitmap.on("click", function(evt) {
        if(evt == 1 || evt == 2) {
          alert("Am I getting here?");
				  evt.preventDefault();
				  o.x = moveingFrom.screenX;
				  o.y = moveingFrom.screenY;
        }
		  });
			
			// the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
			bitmap.addEventListener("pressmove", function(evt) {
                                    
				evt.preventDefault();
				if(myTurn && evt.nativeEvent.button == 0) {
                                    
                                    
					evt.preventDefault();
					var o = evt.target;
					stage.addChild(o);
					o.x = evt.stageX+ o.offset.x;
					o.y = evt.stageY+ o.offset.y;
					update = true;
                                    
				} // end if statement
                                    
			}); // end bitmap pressmove listener
			
			//Add listener for rollover to enlarge marble when it is hovered over
			bitmap.addEventListener("rollover", function(evt) {
                                    
				evt.preventDefault();
				if(myTurn) {
                                    
					var o = evt.target;
					o.scaleX = o.scaleY = 0.65;
					update = true;
                                    
				} // end if statement
                                    
			}); // end bitmap rollover listener
			
			//Add listener for rollout to re-shrink marble when it is not hovered over
			bitmap.addEventListener("rollout", function(evt) {
                                    
				evt.preventDefault();
				if(myTurn) {
                                    
					var o = evt.target;
					o.scaleX = o.scaleY = o.scale;
					update = true;
                                    
				} // end if statement
                                    
			}); // end bitmap rollout listener
			
			myMarbles[i] = bitmap;
            
		} // end for loop
		
		markHomeSpots((boardPosition+3)%6);

		document.getElementById("loader").className = "";
		createjs.Ticker.addEventListener("tick", tick);
		playersInitialized++;
        
	} // end function handleMyMarbleImageLoad(boardPosition)

	// This function is run when the purple marble image is loaded.
	function handleOthersMarlbleImageLoad(boardPosition) {
        
		var bitmap;
		var image;
		var id;
	
		//list of starting positions
		var xPositions;
		var yPositions;
		
		if(boardPosition == 0) {
      image = blueMarbleImage;
      id = "blue";
			xPositions = [418,473,528,583,445,500,555.5,473,528,500];
			yPositions = [700,700,700,700,750,750,750,800,800,850];
		}
		else if(boardPosition == 1) {
      image = redMarbleImage;
      id = "red";
			xPositions = [335,280,225,170,308,253,198,280,225,252];
			yPositions = [650,650,650,650,600,600,600,550,550,500];
		}
		else if(boardPosition == 2) {
      image = greenMarbleImage;
      id = "green";
			xPositions = [335,280,225,170,306,254,199,280,225,252]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(boardPosition == 3) {
      image = yellowMarbleImage;
      id = "yellow";
			xPositions = [500,472,527,445,500,555,418,472,528,583];
			yPositions = [50,100,100,150,150,150,200,200,200,200];
		}
		else if(boardPosition == 4) {
      image = orangeMarbleImage;
      id = "orange";
			xPositions = [830,775,720,665,802,747,692,775,720,747]; 
			yPositions = [250,250,250,250,300,300,300,350,350,400];
		}
		else if(boardPosition == 5) {
      image = purpleMarbleImage;
      id = "purple";
			xPositions = [830,775,720,665,802,747,693,775,720,747]; 
			yPositions = [650,650,650,650,600,600,600,550,550,500];
            
		} // end if else statement
		
		//Create Display Marble
		var displayBitmap = new createjs.Bitmap(image);
		
		if(boardPosition == 0)
			displayMarbles.blue = displayBitmap;
		else if(boardPosition == 1)
			displayMarbles.red = displayBitmap;
		else if(boardPosition == 2)
			displayMarbles.green = displayBitmap;
		else if(boardPosition == 3)
			displayMarbles.yellow = displayBitmap;
		else if(boardPosition == 4)
			displayMarbles.orange = displayBitmap;
		else if(boardPosition == 5)
			displayMarbles.purple = displayBitmap;
			
		displayBitmap.x = 50;
		displayBitmap.y = 65;
		displayBitmap.scaleX = displayBitmap.scaleY = displayBitmap.scale = 0.55;
		othersMarblesContainer.addChild(displayBitmap);
		
		
		for(var i = 0; i < 10; i++){
            
			//Set up the image settings
			bitmap = new createjs.Bitmap(image);
			othersMarblesContainer.addChild(bitmap);
			bitmap.x = xPositions[i];
			bitmap.y = yPositions[i];
			bitmap.regX = bitmap.image.width/2|0;
			bitmap.regY = bitmap.image.height/2|0;
			bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.55;
			bitmap.name = id;//"otherMarble"+othersMarbles.length;
			bitmap.cursor = "pointer";
			
			othersMarbles.push(bitmap);
			
			//Mark occupied spots as not empty
			var mySpot = findClosestSpot(bitmap.x, bitmap.y);
			if(mySpot != null)
				mySpot.isEmpty = false;
            
		} // enf for loop

		document.getElementById("loader").className = "";
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(30);
		playersInitialized++;
        
	} // end function handleOthersMarlbleImageLoad(boardPosition) {
	
	// updates timer to animate piece moves
	function updateTimer() { 
	
		update = true;
	
	} // end function updateTimer()

  function removePlayerMarbles(player) {
    //console.debug("Entering removePlayerMarbles function");
    othersMarbles.forEach(function(elem){
                                          if(elem.name == player) {
                                            var spotToUnmark = findClosestSpot(elem.x, elem.y);
                                            if(spotToUnmark != null) {
                                              spotToUnmark.isEmpty = true;
                                            }
                                            othersMarblesContainer.removeChild(elem);
											stage.removeChild(elem);
                                          }
                                        });
    update = true;
  }
  
	function tick(event) {
        
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		if (update) {
            
			event.preventDefault();
			update = false; // only update once
			stage.update(event);
            
		} // end if statement
        
	} // end function tick(event)

    // prevents the context menu from showing up when using right click 
	document.addEventListener("contextmenu", function(e) {
                              
		e.preventDefault();
                              
	}, false); // end event listener for context menu
  
  var hide = true;
  function hideTheChat() {
    if(hide) {
      document.getElementById("chat_section").style.webkitAnimationName = "";
      document.getElementById("chat_section").style.webkitAnimationName = "hideChat";
      document.getElementById("chat_section").style.left = "-365px";
      document.getElementById("hide").value = "Show";
      hide = false;
    }
    
    else {
      document.getElementById("chat_section").style.webkitAnimationName = "";
      document.getElementById("chat_section").style.webkitAnimationName = 'unhideChat';
      document.getElementById("chat_section").style.left = "10px";
      document.getElementById("hide").value = "Hide";
      hide = true;
    }
  }
  
  var playingSound = true;
  function playButton() {
    if(playingSound) {
      document.getElementById('music_player').pause();
      document.getElementById("music_button").value = "Play";
      playingSound = false;
    }
    
    else {
      document.getElementById('music_player').play();
      document.getElementById("music_button").value = "Pause";
      playingSound = true;
    }
  }
  
  window.onbeforeunload = function(e) {
    if(numberOfPlayers > 0) {
      if(myTurn)
        socket.emit('move', 0, 0, 0, 0);
      socket.emit('dropped', playerIdentifier);
	}
  };