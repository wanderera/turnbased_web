
// process one keyboard input at a time
// i.e. holding left key while moving left is ignored 

// keyboard input lock
const lock = {processingKeyboardInput:false, 
	      code:null};


class Cursor{
    // a cursor located on map
    // move by user keyboard input
    // to make selections
    constructor(systemGrid){
	this.i=0;          this.j=0;
	this.i_velocity=0; this.j_velocity=0;
	this.x=0;          this.y=0;
	this.height = systemGrid.size;
	this.width = systemGrid.size;
	this.targetPos=[0,0];
	this.toMove = false;
    }

    setPosition(x,y){this.x = x, this.y = y;}

    // draw main cursor
    // called every frame
    draw(buffer){
	buffer.fillStyle = "yellow";
	buffer.fillRect(this.x, this.y, this.width, this.height);
    }

    moveLeft(grid){
	if (this.x < grid.size / 2) return false;
	this.i_velocity = -1;//-MAINCURSOR_SPEED*systemGrid.size/60;
	this.targetPos[0] = this.x - grid.size;
	this.targetPos[1] = this.y;
	return true;
    }
    
    moveRight(grid){
	if (this.x + grid.size*1.5 > buffer.canvas.width) return false;
	this.i_velocity = 1;//MAINCURSOR_SPEED*systemGrid.size/60;
	this.targetPos[0] = this.x + grid.size;
	this.targetPos[1] = this.y;
	return true;
    }

    
    moveDown(grid){
	if (this.y + grid.size*1.5 > buffer.canvas.height) return false;
	this.j_velocity = 1;//-MAINCURSOR_SPEED*systemGrid.size/60;
	this.targetPos[1] = this.y + grid.size;
	this.targetPos[0] = this.x;
	return true;
    }
    
    moveUp(grid){
	if (this.y < grid.size / 2) return false;
	this.j_velocity = -1;//-MAINCURSOR_SPEED*systemGrid.size/60;
	this.targetPos[1] = this.y - grid.size;
	this.targetPos[0] = this.x;
	return true;
    }

};


function keyboardInputOccupy(str){
    if (lock.code != null) console.error("unreleased ", lock.code);
    if (keyinputLocKDebugLog) console.log("lock by", str);
    lock.code = str;
    lock.processingKeyboardInput = true;
}

function keyboardInputRelease(str){
    if (lock.code != str)
	console.error("try to release ", str, "but", lock.code, "on hold");
    if (keyinputLocKDebugLog) console.log("release", str);
    lock.code = null;
    lock.processingKeyboardInput = false;
}

function isKeyboardInputReady(){
    return !lock.processingKeyboardInput;
}


function sceneInputEvenets(){    
    // Ignore all other inputs if an input is still being processed 
    if (!isKeyboardInputReady()) return;

    let character = heroes[0];
    switch (event.key) {
    case "ArrowLeft":
	if (character.x < systemGrid.size /2) break;
	character.i_velocity = -1;//CHARACTER_SPEED*systemGrid.size/60;
	character.targetPos[0] = character.x - systemGrid.size;
	character.targetPos[1] = character.y;
	keyboardInputOccupy();
	if (keyinputDebugLog) console.log("left key pressed")
	break;
    case "ArrowRight":
	if (character.x + systemGrid.size/2 > buffer.canvas.width) break;
	character.i_velocity = 1;//CHARACTER_SPEED*systemGrid.size/60;
	character.targetPos[0] = character.x + systemGrid.size;
	character.targetPos[1] = character.y;
	keyboardInputOccupy();
	if (keyinputDebugLog)console.log("right key pressed")
	break;
    case "ArrowUp":
	if (character.y <  systemGrid.size/2 ) break;
	character.j_velocity = -1;//-CHARACTER_SPEED*systemGrid.size/60;
	character.targetPos[1] = character.y - systemGrid.size;
	character.targetPos[0] = character.x;
	keyboardInputOccupy();
	if (keyinputDebugLog) console.log("up key pressed")
	break;
    case "ArrowDown":
	if (character.y + systemGrid.size/2 > buffer.canvas.height) break;
	character.j_velocity = 1;//CHARACTER_SPEED*systemGrid.size/60;
	character.targetPos[1] = character.y + systemGrid.size;
	character.targetPos[0] = character.x;
	keyboardInputOccupy();
	if (keyinputDebugLog) console.log("down key pressed")
	break;

    case "a":
	if (mainCursor.moveLeft(systemGrid))
	    keyboardInputOccupy();
	
	if (keyinputDebugLog) console.log("left a key pressed")
	break;
    case "d":
	if(mainCursor.moveRight(systemGrid))
	    keyboardInputOccupy();
	
	if (keyinputDebugLog) console.log("right d key pressed")
	break;
    case "w":
	if (mainCursor.moveUp(systemGrid))
	    keyboardInputOccupy();
	if (keyinputDebugLog) console.log("up w key pressed")
	break;
    case "s":
	if (mainCursor.moveDown(systemGrid))
	    keyboardInputOccupy();
	
	if (keyinputDebugLog) console.log("down s key pressed")
	break;

	
    case "0":
	tilePaintingType = tile_type_enum.WALKABLE
	if (keyinputDebugLog) console.log("num 0 key pressed")
	break;

    case "1":
	tilePaintingType = tile_type_enum.BLOCKING
	if (keyinputDebugLog) console.log("num 1 key pressed")
	break;

    case "p":
	tilePaintingType = -1;
	if (keyinputDebugLog) console.log("p key pressed");
	break;

    case "l":
	let str = "[\n";
	for (let j=0; j<systemGrid.nodes[0].length; j++){
	    for (let i =0; i<systemGrid.nodes.length; i++){
		str += systemGrid.nodes[i][j].type+", ";
		if (i == (systemGrid.nodes[1].length-1))
		    str += "\n";
	    }
	}
	str += "]";
	console.log(str);
	if (keyinputDebugLog) console.log("l key pressed");
	break;
    case "m":
	map.src = "map2.jpg";
	if (keyinputDebugLog) console.log("change map!");
	break;
    case "Enter":
	character.toMove = true;
	character.setMoveTarget(mainCursor.i*systemGrid.size,
				mainCursor.j*systemGrid.size);
	break;
	
    case "Shift":
	// reset character pos to endNode in path
	// to restore pre movement position
	if(character.path != null){
	    if (character.path.length)
	    character.setPos(character.path[character.path.length-1].i*systemGrid.size,
			     character.path[character.path.length-1].j*systemGrid.size);
	}
	// clean to move
	character.toMove = false;
	character.hasMoved = false;
	if (keyinputDebugLog) console.log("clear on shift");
	break;
    default:
	if (keyinputDebugLog) console.log("unknown key");
	break;
    }
}

function startMenuInputEvents(){
    switch (event.key) {
    case "w":
	break;
    case "s":
	break;
    case "Enter":
	playConfirmSound();
	toStartGame = true;
	break;
    default:
	break;
    }


}



function getCursorPosition (event) {
    let canvas = document.querySelector("canvas");
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let scaleY = canvas.height / rect.height;
    
    let x = viewport.startTilePos[0] + (event.clientX - rect.left)/rect.width * viewport.w;
    let y = viewport.startTilePos[1] + (event.clientY - rect.top)/rect.height *viewport.h;

    return [x,y];
}



function updateMainCursor(){
    /*if (mainCursor.i_velocity != 0){
	if (Math.abs(mainCursor.x - mainCursor.targetPos[0]) > 0.0005){
	    mainCursor.x += mainCursor.i_velocity*MAINCURSOR_SPEED*systemGrid.size/60;
	}else{
	    // left/right movement is done
	    mainCursor.i_velocity = 0;
	    mainCursor.x = mainCursor.targetPos[0];
	    mainCursor.i = Math.floor(mainCursor.x/systemGrid.size);
	    
	    keyboardInputRelease("mainCursorMove");
	}
    }
    
    if (mainCursor.j_velocity != 0){
	if (Math.abs(mainCursor.y - mainCursor.targetPos[1]) > 0.0005)
	    mainCursor.y += mainCursor.j_velocity*MAINCURSOR_SPEED*systemGrid.size/60;
	else{
	    // up/down movement is done
	    mainCursor.j_velocity = 0;
	    mainCursor.y = mainCursor.targetPos[1];
	    
	    mainCursor.j = Math.floor(mainCursor.y/systemGrid.size);
	    keyboardInputRelease("mainCursorMove");
	}	
    }*/
    
    if ((Math.abs(mainCursor.x - mainCursor.targetPos[0]) > 0.0005)||
	(Math.abs(mainCursor.y - mainCursor.targetPos[1]) > 0.0005)){
	mainCursor.x += mainCursor.i_velocity*MAINCURSOR_SPEED*systemGrid.size/60;
	mainCursor.y += mainCursor.j_velocity*MAINCURSOR_SPEED*systemGrid.size/60;
    }else{
	if ((mainCursor.i_velocity) || (mainCursor.j_velocity)){
	    mainCursor.i_velocity = 0;
	    mainCursor.x = mainCursor.targetPos[0];
	    mainCursor.i = Math.floor(mainCursor.x/systemGrid.size);

	    mainCursor.j_velocity = 0;
	    mainCursor.y = mainCursor.targetPos[1];
	    mainCursor.j = Math.floor(mainCursor.y/systemGrid.size);
	    
	    keyboardInputRelease("mainCursorMove");
	}
    }
    
}
