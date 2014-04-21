var moveingFrom = [];
var gameOver = false;
var myTurn = true;
var turnTracker = new createjs.Text("Your Turn!", "28px Jing Jing", "#ff7700");


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
  
    //debug
    return true;
        
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
  
  
  //Check to see if this client has won
	function hasWon() {
        
		for(var i = 0; i < 10; i++) {
            
			if(findClosestSpot(myMarbles[i].x, myMarbles[i].y).home != true) {
                
				return false;
                
            } // end if statement
            
		} // end for loop
		
		return true;
        
	} // end hasWon()
  
  
  function removePlayerMarbles(player) {
    //console.debug("Entering removePlayerMarbles function");
    othersMarbles.forEach(function(elem){
                                          if(elem.name == player) {
                                            var spotToUnmark = findClosestSpot(elem.x, elem.y);
                                            if(spotToUnmark != null) {
                                              spotToUnmark.isEmpty = true;
                                            }
                                            othersMarblesContainer.removeChild(elem);
                                          }
                                        });
    update = true;
  }