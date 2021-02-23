
var buffer, controller, display, loop, player, render, resize, sprite_sheet;

buffer = document.createElement("canvas").getContext("2d");
display = document.querySelector("canvas").getContext("2d");

const GRID_DIM = [10, 10];
const GRID_SIZE = SPRITE_SIZE;

var systemGrid = new SystemGrid(GRID_DIM, GRID_SIZE);



function render() {

    /* Draw the background. */
    buffer.fillStyle = "darkgray";
    buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

    /* Draw underlying grid */
    systemGrid.draw(buffer);
    
    /* When you draw your sprite, just use the animation frame value to determine
       where to cut your image from the sprite sheet. It's the same technique used
       for cutting tiles out of a tile sheet. Here I have a very easy implementation
       set up because my sprite sheet is only a single row. */

    /* 02/07/2018 I added Math.floor to the player's x and y positions to eliminate
       antialiasing issues. Take out the Math.floor to see what I mean. */
    buffer.drawImage(sprite_sheet.image, player.animation.frame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, Math.floor(player.x), Math.floor(player.y), SPRITE_SIZE, SPRITE_SIZE);

    systemGrid.drawPath(path);

    
    display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);

};

function updatePlayer(){
    if (player.x_velocity != 0){
	if (Math.abs(player.x - player.targetPos[0]) > 0.0005){
	    let facing = 2; // left
	    if (player.x_velocity > 0) facing = 1; // right

	    // set animation
	    player.animation.change(sprite_sheet.frame_sets[facing]);
	    
	    player.x += player.x_velocity;
	}else{ player.x_velocity = 0;
	       player.x = player.targetPos[0];
	     }
    }else{
	// if no left or right set to front
	player.animation.change(sprite_sheet.frame_sets[0]);
    }
    
    if (player.y_velocity != 0){
	if (Math.abs(player.y - player.targetPos[1]) > 0.0005)
	    player.y += player.y_velocity;
	else{ player.y_velocity = 0;
	      player.y = player.targetPos[1];
	    }
    }
}

var path = [];

function loop(time_stamp) {

    player.animation.update();
    updatePlayer()

    if (tilePaintingType == -2){
	console.log("calculating path to "+targetCalculatePathPos);
	path = systemGrid.findPath(0,0,targetCalculatePathPos[0], targetCalculatePathPos[1]);
	tilePaintingType = -1;
    }

    
    render();

    window.requestAnimationFrame(loop);

};

function resize() {

    display.canvas.width = document.documentElement.clientWidth - 32;
    if (display.canvas.width > document.documentElement.clientHeight - 32) {
	display.canvas.width = document.documentElement.clientHeight - 32;
    }

    display.canvas.height = display.canvas.width;

    display.imageSmoothingEnabled = false;

};



/* The sprite sheet object holds the sprite sheet graphic and some animation frame
   sets. An animation frame set is just an array of frame values that correspond to
   each sprite image in the sprite sheet, just like a tile sheet and a tile map. */
sprite_sheet = {

    frame_sets:[[0, 1], [2, 3], [4, 5]],// standing still, walk right, walk left
    image:new Image()

};


// player
player = {

    animation:new Animation(sprite_sheet.frame_sets[0], 40),
    height:SPRITE_SIZE,    width:SPRITE_SIZE,
    x:0,          y:0,
    x_velocity:0, y_velocity:0,
    targetPos:[0,0]
};








////////////////////
//// INITIALIZE ////
////////////////////

function init() {
    buffer.canvas.width = 160;
    buffer.canvas.height = 160;

    window.addEventListener("resize", resize);

    initInputEvents(player, systemGrid);
    //window.addEventListener("keyup", controller.keyUpDown);

    resize();

    sprite_sheet.image.addEventListener("load", function(event) {// When the load event fires, do this:
	window.requestAnimationFrame(loop);// Start the game loop.
    });
    sprite_sheet.image.src = "animation.png";// Start loading the image.
   
}

init();
path = systemGrid.findPath(0,0, 5, 5);
systemGrid.drawPath(path);
window.requestAnimationFrame(loop);// Start the game loop.

