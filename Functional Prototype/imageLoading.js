
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
	function handleMyMarbleImageLoad(boardPosition) {
        
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
					console.debug("evt.stageX:" + evt.stageX);
					console.debug("evt.stageY:" + evt.stageY);
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
							socket.emit('move', startSpot.x, startSpot.y, endSpot.x, endSpot.y);
							
							
							timersManager.turnIndex++;
							if(timersManager.turnIndex >= timersManager.timers.length)
								timersManager.turnIndex = 0;
																
							if(timersManager.countDown)
								timersManager.timers[timersManager.turnIndex].isNewTurn = true;
							
							
							
							if(hasWon()) {
                      
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
                     bitmap.id = "opponent";
			
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