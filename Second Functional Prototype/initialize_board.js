var turn_marble = null;

window.onload = function() {
  var arrayDiv = new Array();     //Multidimensional array representing marbles/holes
  var line_holes;
  
  //These determines who playing and who doesn't
  var circle_red = 'circle_red';
  var circle_blue = 'circle_empty'; //if set to circle_empty, that color isn't playing
  var circle_purple = 'circle_empty';
  var circle_green = 'circle_empty';
  var circle_orange = 'circle_empty';
  var circle_yellow = 'circle_yellow';
  
  //this creates the turn marble and some vertical space after it
  turn_marble = document.createElement('div');
  turn_marble.id = 'circle_red';
  turn_marble.className = 'circle';
  var line_break1 = document.createElement('br');
  document.body.appendChild(turn_marble);
  document.body.appendChild(line_break1);
  var line_break2 = document.createElement('br');
  document.body.appendChild(line_break2);
  
  //this is for the red circles
  var red_circles = 1;
  for(line_holes = 1; line_holes <= 4; line_holes++) {
    arrayDiv[line_holes] = new Array();
    
    for(var i = 0; i < red_circles; i++) {
      arrayDiv[line_holes][i] = document.createElement('div');
      arrayDiv[line_holes][i].id = circle_red;
      arrayDiv[line_holes][i].className = 'circle';
      //arrayDiv[line_holes][i].onclick = function() {foo(this);};
      document.body.appendChild(arrayDiv[line_holes][i]);
    }
    red_circles++;
    var line_break = document.createElement('br');
    document.body.appendChild(line_break);
  }

  //upper half of hexagon and attached marbles
  var blue_circles   = 4;
  var purple_circles = 4;
  var empty_circles  = 5;

  for(line_holes = 5; line_holes <= 9; line_holes++) {
    arrayDiv[line_holes] = new Array();
    
    var j = 0;
    for(var i = 0; i < blue_circles; i++) {
      arrayDiv[line_holes][j] = document.createElement('div');
      arrayDiv[line_holes][j].id = circle_blue;
      arrayDiv[line_holes][j].className = 'circle';
      document.body.appendChild(arrayDiv[line_holes][j]);
      
      j++;
    }
    blue_circles--;
    
    for(var i = 0; i < empty_circles; i++) {
      arrayDiv[line_holes][j] = document.createElement('div');
      arrayDiv[line_holes][j].id = 'circle_empty';
      arrayDiv[line_holes][j].className = 'circle';
      //arrayDiv[line_holes][j].onclick = function() {foo(this);};
      document.body.appendChild(arrayDiv[line_holes][j]);
      j++;
    }
    empty_circles++;
    
    for(var i = 0; i < purple_circles; i++) {
      arrayDiv[line_holes][j] = document.createElement('div');
      arrayDiv[line_holes][j].id = circle_purple;
      arrayDiv[line_holes][j].className = 'circle';
      document.body.appendChild(arrayDiv[line_holes][j]);
      j++;
    }
    purple_circles--;
    
    var line_break = document.createElement('br');
    document.body.appendChild(line_break);
  }
  
  //lower half of hexagon and attached points
  var green_circles  = 1;
  var orange_circles = 1;
  empty_circles = empty_circles - 2;

  for(line_holes = 10; line_holes <= 13; line_holes++) {
    arrayDiv[line_holes] = new Array();
    
    var j = 0;
    for(var i = 0; i < green_circles; i++) {
      arrayDiv[line_holes][j] = document.createElement('div');
      arrayDiv[line_holes][j].id = circle_green;
      arrayDiv[line_holes][j].className = 'circle';
      document.body.appendChild(arrayDiv[line_holes][j]);
      
      j++;
    }
    green_circles++;
    
    for(var i = 0; i < empty_circles; i++) {
      arrayDiv[line_holes][j] = document.createElement('div');
      arrayDiv[line_holes][j].id = 'circle_empty';
      arrayDiv[line_holes][j].className = 'circle';
      document.body.appendChild(arrayDiv[line_holes][j]);
      j++;
    }
    empty_circles--;
    
    for(var i = 0; i < orange_circles; i++) {
      arrayDiv[line_holes][j] = document.createElement('div');
      arrayDiv[line_holes][j].id = circle_orange;
      arrayDiv[line_holes][j].className = 'circle';
      document.body.appendChild(arrayDiv[line_holes][j]);
      j++;
    }
    orange_circles++;
    
    var line_break = document.createElement('br');
    document.body.appendChild(line_break);
  }

  //down point containing yellow marbles. currently featuring circle_empty spaces
  //in order to test the check_game_over function
  var yellow_circles = 4;
  for(line_holes = 14; line_holes <= 17; line_holes++) {
    arrayDiv[line_holes] = new Array();
    
    for(var i = 0; i < yellow_circles; i++) {
      arrayDiv[line_holes][i] = document.createElement('div');
      arrayDiv[line_holes][i].id = circle_yellow;
      arrayDiv[line_holes][i].className = 'circle';
      document.body.appendChild(arrayDiv[line_holes][i]);
    }
    yellow_circles--;
    
    var line_break = document.createElement('br');
    document.body.appendChild(line_break);
  }
  
  //anchors is an array containing all the divs we generated that are of the class circle
  var anchors = document.getElementsByClassName("circle");

  //and this makes all of them clickable
  for(var i = 0; i < anchors.length; i++) {
    var anchor = anchors[i];
    anchor.onclick = function() {
      foo(this);
    }
  }

};