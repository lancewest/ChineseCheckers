//Global Variables
var socket;

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
		
		if(timerOption == 2 || timerOption == 1)
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
		function(startX, startY, endX, endY, turn) {
			/*var convertedStartSpot = convertSpot(startX, startY, boardPosition);
			var convertedEndSpot = convertSpot(endX, endY, boardPosition);*/
			
			/*var convertedStartSpot = convertSpot(startX, startY, boardPosition);
			var convertedEndSpot = convertSpot(endX, endY, boardPosition);*/
			
      if(startX != 0 || startY != 0 || endX != 0 || endY != 0) {
			  var startSpot = spotMatrix[startY][startX];
			  var endSpot = spotMatrix[endY][endX];
			
			  startSpot.isEmpty = true;
			  endSpot.isEmpty = false;
			
			var marble = findClosestOpponentMarble(startSpot.screenX, startSpot.screenY);

			marble.parent.addChild(marble);
			marble.offset = {x:marble.x, y:marble.y};
            var tween = createjs.Tween.get(marble).to({ "x": endSpot.screenX, "y": endSpot.screenY }, 1000);
              
			timersManager.turnIndex++;
			if(timersManager.turnIndex >= timersManager.timers.length)
				timersManager.turnIndex = 0;
																
			if(timersManager.countDown)
				timersManager.timers[timersManager.turnIndex].isNewTurn = true;
			}
      
			if(turn == "Your Turn!") {
              
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
		function(turn) {
			turnTracker.text = turn;
			myTurn = false;
			update = true;
		}); // end socket.on for you_moved
		
	// If server responds to our move, update turn status
    socket.on(
		'you_win',
		function(turn) {
      gameOver = true;
			turnTracker.text = "You Win!";
			myTurn = false;
			update = true;
		}); // end socket.on for you_win
		
	// If server tells us that the other player has won:
    socket.on(
      'win',
      function(winner) {
			update = true;
			gameOver = true;
			turnTracker.text = "Game Over! You Lose! " + winner + " wins!";
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
          div.append($('<span></span>').addClass('user_name').text(user_name));
          div.append($('<span></span>').addClass('says').text(' says: '));
          div.append($('<span></span>').addClass('msg').text(msg));
          // Add the new div element to the chat board.
          $('#board').append(div);
          update = true;
        //}
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
        
        
        socket.emit('move', 0, 0, 0, 0);
        socket.emit('dropped', playerIdentifier);
        
        location.reload(true);
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