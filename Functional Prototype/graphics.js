var canvas, stage, canvasHold;

var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;
var timersManager = [];


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
		
		var seconds = Math.round(timerToChange.time%60) < 10 ? "0" + Math.round(timerToChange.time%60) : Math.round(timerToChange.time%60);
		var timeInMinutes = Math.floor(timerToChange.time/60) +":" + seconds;
    
		if(timerToChange.isNewTurn && !timerToChange.firstTurn) {
      timerToChange.time += 15;
			timeInMinutes = Math.floor(timerToChange.time/60) +":" + Math.round(timerToChange.time%60) + "   +15 sec";
		}
		timerToChange.isNewTurn = false;
    timerToChange.firstTurn = false;
    
		timerToChange.textElement.text = timerToChange.userName + " - " + timeInMinutes;
		update = true;
		
	}
  
  
  // stops the Ticker
	function stop() {
        
		createjs.Ticker.removeEventListener("tick", tick);
        
	} // end function stop()
  
  
  // updates timer to animate piece moves
	function updateTimer() { 
	
		update = true;
	
	} // end function updateTimer()
  
  
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