var previous_clicked = null; //Stores the previous marble/hole clicked

/*This array of turns is cyclically iterated. Different array lengths
mean a different number of players. Right now there's only a red turn
because I was testing the check_game_over function. The original was
commented out*/
//var turns = ['circle_red', 'circle_purple', 'circle_orange',
//             'circle_yellow', 'circle_green', 'circle_blue'];
var turns = ['circle_red', 'circle_yellow'];

var turn = null; //string to represent current turn


var has_jumped = false; //serves to tell if a player has already jumped and plans
                        //to jump more times
                        
/*The following are the x and y coordinates of the red home. This was taken by hand
but I suspect there is a way to automatize the calculation of these. Right now
they only work on fullscreen on the lab screen (1920x1080), but these isn't hard to fix
with a functions that kicks in when the window is resized and more relative coordinates*/                        
var red_home_x    = [890,925, 960,995,907.5,942.5,977.5,925,960,942.5];
var red_home_y    = [518,518,518,518,553,553,553,588,588,623];

/*Rest of the coordinates
var blue_home_x   = [334.5,299.5, 960,995,907.5,942.5,977.5,925,960,942.5,];
var blue_home_y   = [203,203,203,203,238,238,238,273,273,308];

var purple_home_x = [890,925, 960,995,907.5,942.5,977.5,925,960,942.5,];
var purple_home_y = [203,203,203,203,238,238,238,273,273,308];

var green_home_x  = [890,925, 960,995,907.5,942.5,977.5,925,960,942.5,];
var green_home_y  = [518,518,518,518,553,553,553,588,588,623];

var orange_home_x = [890,925, 960,995,907.5,942.5,977.5,925,960,942.5,];
var orange_home_y = [518,518,518,518,553,553,553,588,588,623];
*/

//Implementing yellow home for minimal functionality
var yellow_home_x = [890,925, 960,995,907.5,942.5,977.5,925,960,942.5];
var yellow_home_y = [168,168,168,168,133,133,133,98,98,63];


//this function is called whenever a marble is clicked
var foo = function(clicked_object)
{
  //this code may be useless.
  if(turn == null) {
    turn = turns[0];
  }
  
  var position = clicked_object.getBoundingClientRect();
  var x = position.left;
  var y = position.top;
  //alert(x + " " + y);
  
  //computes the current turn index so that the next turn can be calculated
  //the (current) turn doesn't change yet
  var turn_index = turns.indexOf(turn);
  var next_turn = turns[(turn_index+1)%turns.length];
  
  //rudimentary debugging
  //if(clicked_object.id != turn &&
  //   previous_clicked != null) {
  //  alert(turn);
  //  return;
  //}
  
  //if there is no register of the last marble clicked,
  //make the current one be it and exit the function
  if(previous_clicked == null) {
    previous_clicked = clicked_object;
    return;
  }
  
  /*This is probably overly complicated. The previous clicked is the piece that's
  going to move, so it must be that piece's color turn. Pieces must move to an empty
  hole, which is the (current) clicked_object. After all that, the move must be determined
  be valid. Multiple jumps, however. return false on each intermediate jump, so that
  the turn and the previous_clicked marble aren't changed.*/
  if(previous_clicked.id != 'circle_empty' &&
     previous_clicked.id == turn &&
     clicked_object.id == 'circle_empty' &&
     is_move_valid(previous_clicked, clicked_object)) {

      clicked_object.id = previous_clicked.id;
      previous_clicked.id = 'circle_empty';
      previous_clicked = null;
      
      //Displays a pop up message when red wins
      if(check_game_over()) {
        alert(turn + " won.");
        //call a function here to really end the game
      }
      
      turn = next_turn;
      turn_marble.id = turn;
      
  }
  
  //Do not erase the previously clicked marble from memory is there are
  //still some jumps to be done
  if(!has_jumped) {
    previous_clicked = null;
  }
};


var check_game_over = function() {
  var current_element;
  
  var home_x = null;
  var home_y = null;

  if(turn == 'circle_red') {
    home_x = red_home_x;
    home_y = red_home_y;
  }
  
  if(turn == 'circle_yellow') {
    home_x = yellow_home_x;
    home_y = yellow_home_y;
  }
    
  for(var i = 0; i < home_x.length; i++) {
    //this functions gets the html tag (in this case the div that represents the marbles)
    //of a certain position
    current_element = document.elementFromPoint(home_x[i], home_y[i]);
    if(current_element.id != turn) {
      return false;
    }
  }
  
  return true;
}

var is_move_valid = function(current, next) {
  //uncomment this line to for quick testing (almost all moves would be legal)
  //return true;
  
  if(is_adjacent(current, next) && !has_jumped) {
    return true;
  }
  
  if(is_jump_valid(current, next)) {
    if(are_there_more_jumps(next)) {
      
      /*This was just convenient to implement, but it's annoying.
      This prompts a confirmation pop up, which ends the function
      if the user is done jumping.*/
      var r = confirm("Is this your last jump? OK means yes.");
      if (r == true) {
	  has_jumped = false;
        return true;
      }

      //this is a lot like what the foo function usually does, but without changing
      //the turn or setting the previous_clicked to null
      next.id = current.id;
      current.id = 'circle_empty';
      has_jumped = true;
      previous_clicked = next;
      return false;
    }
    has_jumped = false;
    return true;
  }
  
  return false;
}

var are_there_more_jumps = function(pos) {
  var hor_offsets = [35,-35,70,-70];
  var ver_offsets = [0, 70, -70];
  
  //this function gets the position of and html element, a div in this case
  var position = pos.getBoundingClientRect();
  var x = position.left;
  var y = position.top;
  
  //this checks more than necessary, returning false for those extra checks
  //this checks for positions to which it's never possible to jump
  for(var i = 0; i < hor_offsets.length; i++) {
    for(var j = 0; j < ver_offsets.length; j++) {
      var jump_pos = document.elementFromPoint(x+hor_offsets[i], y+ver_offsets[j]);
      if(is_jump_valid(pos, jump_pos)) {
        return true;
      }
    }
  }
  
  return false;
}

var is_adjacent = function(current, next) {
  var current_position = current.getBoundingClientRect();
  var current_x = current_position.left;
  var current_y = current_position.top;
  
  var next_position = next.getBoundingClientRect();
  var next_x = next_position.left;
  var next_y = next_position.top;
  
  //Math.abs = absolute value
  var hor_offset = Math.abs(next_x-current_x) == 35 || Math.abs(next_x-current_x) == 17.5;
  var ver_offset = Math.abs(next_y-current_y) == 35 || Math.abs(next_y-current_y) == 0;
  
  if(hor_offset && ver_offset) {
    return true;
  }
  
  return false;
}

var is_jump_valid = function(current, next) {
  var current_position = current.getBoundingClientRect();
  var current_x = current_position.left;
  var current_y = current_position.top;
  
  var next_position = next.getBoundingClientRect();
  var next_x = next_position.left;
  var next_y = next_position.top;
  
  var hor_offset = (next_x-current_x)/2;
  var ver_offset = (next_y-current_y)/2;
  
  //this was even more rudimentary debugging
  //document.write(ver_offset);
  
  var valid1 = Math.abs(hor_offset) == 17.5 && Math.abs(ver_offset) == 35;
  var valid2 = Math.abs(hor_offset) == 35 && Math.abs(ver_offset) == 0;
  
  if( valid1 || valid2 ) {
    var middle_marble = document.elementFromPoint((next_x+current_x)/2, (next_y+current_y)/2);
    
    //this would mean you aren't just jumping an empty space
    if(middle_marble.id != 'circle_empty') {
      return true;
    }
  }
  
  return false;
}