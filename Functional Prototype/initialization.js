// Declare Marble Images
var redMarbleImage;
var blueMarbleImage;
var orangeMarbleImage; 
var greenMarbleImage; 
var yellowMarbleImage; 
var purpleMarbleImage; 

var spotsInitialized = false;
var playersInitialized = 0;
var playerIdentifier = "unassigned";
var numberOfPlayers;

// containers for player pieces and board
var spotContainer = new createjs.Container();
var myMarblesContainer = new createjs.Container();
var othersMarblesContainer = new createjs.Container();

//Storage for game objects
var spotMatrix = [];    // contains board spots
var othersMarbles = []; // contains opponenet game pieces
var myMarbles = [];     // contains your game pieces


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
            
            handleMyMarbleImageLoad(myBoardPosition);
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