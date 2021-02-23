
const PLAYER_SPEED = 2; //  # grid walked / sec

var tilePaintingType = tile_type.WALKABLE;
var targetCalculatePathPos = [-1,-1];

function initInputEvents(player, systemGrid){
    
    window.addEventListener("keydown", function(event){
	if (event.defaultPrevented) {
	    return; // Do nothing if the event was already processed
	}

	switch (event.key) {
	case "a":
	case "ArrowLeft":
	    if (player.x < systemGrid.size /2) break;
	    player.x_velocity = -PLAYER_SPEED*systemGrid.size/60;
	    player.targetPos[0] = player.x - systemGrid.size;
	    player.targetPos[1] = player.y;
	    console.log("left key pressed")
	    break;
	case "d":
	case "ArrowRight":
	    if (player.x + systemGrid.size/2 > buffer.canvas.width) break;
	    player.x_velocity = PLAYER_SPEED*systemGrid.size/60;
	    player.targetPos[0] = player.x + systemGrid.size;
	    player.targetPos[1] = player.y;
	    console.log("right key pressed")
	    break;
	case "w":
	case "ArrowUp":
	    if (player.y <  systemGrid.size/2 ) break;
	    player.y_velocity = -PLAYER_SPEED*systemGrid.size/60;
	    player.targetPos[1] = player.y - systemGrid.size;
	    player.targetPos[0] = player.x;
	    console.log("up key pressed")
	    break;
	case "s":
	case "ArrowDown":
	    if (player.y + systemGrid.size/2 > buffer.canvas.height) break;
	    player.y_velocity = PLAYER_SPEED*systemGrid.size/60;
	    player.targetPos[1] = player.y + systemGrid.size;
	    player.targetPos[0] = player.x;
	    console.log("down key pressed")
	    break;

	case "0":
	    tilePaintingType = tile_type.WALKABLE
	    console.log("num 0 key pressed")
	    break;

	case "1":
	    tilePaintingType = tile_type.BLOCKING
	    console.log("num 1 key pressed")
	    break;

	case "p":
	    tilePaintingType = -1;
	    console.log("p key pressed");
	    break;
	default:
	    console.log("unknown key");
	    break;
	}
    });

    function getCursorPosition (event) {
	let x = event.clientX / display.canvas.width*buffer.canvas.width;
	let y = event.clientY / display.canvas.height*buffer.canvas.height;

	return [x,y];
    }

    window.addEventListener("click", function(event){
	let coords = getCursorPosition(event); 
	let coords_ij = [Math.floor(coords[0] / systemGrid.size),
			 Math.floor(coords[1] / systemGrid.size)];
	
	console.log("clicked on grid : " + coords_ij);

	if (tilePaintingType == -1){
	    //calculate path
	    targetCalculatePathPos = coords_ij;
	    tilePaintingType = -2;
	    console.log("set target pos "+coords_ij);
	}else // paint
	    systemGrid.setGridType(coords_ij[0], coords_ij[1], tilePaintingType);
    });


} 
