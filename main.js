"use strict";

const CHARACTER_SPEED = 3; //  # grid walked / sec
const MAINCURSOR_SPEED = 10;

const SPRITE_SIZE = 16;
const ANIMATION_DELAY = 40;


// viewport aspect ratio w/h
const aspectRatio = 1.5;
const VIEWPORT_WIDTH_GRID_COUNT = 15;

const keyinputDebugLog = true;
const battleStateDebugLog = true;
const battleStateDebugLogEnterNewState = true;
const keyinputLocKDebugLog = true;



var buffer, display, viewport;

buffer = document.createElement("canvas").getContext("2d");
display = document.querySelector("canvas").getContext("2d");

var systemGrid = null;// = new SystemGrid([20,20], SPRITE_SIZE);
var mainCursor = null;// new Cursor(systemGrid);
var battleState;;

var startMenu;


// character list
var heroes = [];
var enermies = [];


let toStartGame = false;

// set a fixed display pixel range
// width = 16x15 height=width/aspectRatio
viewport = {w:0, h:0, startTilePos:[0,0],
	    getMainCursorCenterdViewport(world_buffer){
		this.w = systemGrid.size*VIEWPORT_WIDTH_GRID_COUNT;
		this.h = this.w/aspectRatio;

		this.startTilePos = [mainCursor.x - (!(this.w%(2*systemGrid.size))?
						     this.w :
						     (this.w - systemGrid.size))/2,
				     mainCursor.y - (!(this.h%(2*systemGrid.size))?
						     this.h :
						     (this.h - systemGrid.size))/2];
		if (this.startTilePos[0] < 0 ) this.startTilePos[0] = 0;
		if (this.startTilePos[0] > world_buffer.canvas.width - this.w)
		    this.startTilePos[0] = world_buffer.canvas.width - this.w;
		if (this.startTilePos[1] < 0 ) this.startTilePos[1] = 0;
		if (this.startTilePos[1] > world_buffer.canvas.height - this.h)
		    this.startTilePos[1] = world_buffer.canvas.height - this.h;
	    },

	    getFullViewport(world_buffer){
		this.startTilePos  = [0,0];
		this.w = world_buffer.canvas.width;
		this.h = world_buffer.canvas.height;
	    }


	   };


// debug tools
var tilePaintingType = tile_type_enum.WALKABLE;
var targetCalculatePathPos = [-1,-1];


function render() {

    if (startMenu.isOn){
	startMenu.drawFullDisplay();
    }else
	
    {// draw scene 
	if (!battleState) return;
	// Draw background image
	buffer.drawImage(map, 0, 0, map.width, map.height,
			 0,0, buffer.canvas.width, buffer.canvas.height);
	
	/* Draw underlying grid */
	//systemGrid.draw(buffer);

	// draw ui tiles	
	battleState.drawUITiles();

	// draw main cursor
	mainCursor.draw(buffer);

	// draw characters
	for (let c of heroes)
	    c.draw(null, buffer);
	
	for (let e of enermies) {
	    e.draw(null, buffer);

	}

	// draw top layer ui or animation
	battleState.drawTopLayer();


	
	//viewport.getFullViewport(buffer);
	viewport.getMainCursorCenterdViewport(buffer);
	
	display.drawImage(buffer.canvas,
			  viewport.startTilePos[0], viewport.startTilePos[1],
			  viewport.w, viewport.h,
			  0, 0, display.canvas.width, display.canvas.height);
    }

};

let initBattleState = false;
function loop(time_stamp) {


    render();

    // update
    if (startMenu.isOn){
	if (toStartGame){
	    if (!startMenu.globalImgLoaded)
		loadScene();
	    else{
		clearScene();
		reloadScene();
	    }
	    startMenu.isOn = false;
	    console.log("start");
	}
	    
    }else
    {
	if((!imageLoadCount) && (!initBattleState)){
	    
	    loadHeroes();
	    loadEnermies();

	    battleState = new BattleState(heroes, enermies);
	    loadIntro();
	    loadTutorial();
	    initBattleState = true;
	}
	if (initBattleState)
	    battleState.update();
	
    }
    

    window.requestAnimationFrame(loop);

};


function initInputEvents(){
    
    window.addEventListener("keydown", function(event){
	if (event.defaultPrevented) {
	    return; // Do nothing if the event was already processed
	}

	if (!isKeyboardInputReady()) return;

	if (!startMenu.isOn){
	    let inBattleState = battleState.inputEvents(event.key);
	    if (!inBattleState)
		sceneInputEvenets();
	}else startMenuInputEvents();

    });

    window.addEventListener("click", function(event){
	let coords = getCursorPosition(event);
	
	console.log("clicked on psotion : " + coords);

	if (!startMenu.isOn){
	    let coords_ij = [Math.floor(coords[0]/ systemGrid.size),
			     Math.floor(coords[1]/ systemGrid.size)];
	
	    console.log("clicked on grid : " + coords_ij,
		       systemGrid.nodes[coords_ij[0]][coords_ij[1]].type);
	
	    if (tilePaintingType == -1){
		//calculate path
		targetCalculatePathPos = coords_ij;
		tilePaintingType = -2;
		console.log("set target pos "+coords_ij);
	    }else{ // paint
		systemGrid.setGridType(coords_ij[0], coords_ij[1], tilePaintingType);
	    }
	}
    });
}

function resize() {

    display.canvas.width = document.documentElement.clientWidth * 0.8;
    if (display.canvas.width > document.documentElement.clientHeight * 0.8) {
	display.canvas.width = document.documentElement.clientHeight * 0.8;
    }

    // same aspect ratio as viewport
    display.canvas.height = display.canvas.width/aspectRatio;

    display.imageSmoothingEnabled = false;

};





////////////////////
//// INITIALIZE ////
////////////////////

let imageLoadTotal = 6;
let imageLoadCount = imageLoadTotal;

let frame_sets =[[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11]];

let map = new Image();
let portrait = new Image();
let hero_walking_sprite = new Image();
let enermy_walking_sprite = new Image();
let hero_battle_sprite = new Image();
let enermy_battle_sprite = new Image();
 

function onloadHandler(){
    imageLoadCount--;
    if (!imageLoadCount){
	window.requestAnimationFrame(loop);// Start the game loop.
    }
    console.log("image load", 1-(imageLoadCount / imageLoadTotal));
}

function mapOnLoadHandler(){
    imageLoadCount--;
    buffer.canvas.width = map.width;
    buffer.canvas.height = map.height;

    systemGrid = new SystemGrid([Math.round(map.width / SPRITE_SIZE),
				 Math.round(map.height / SPRITE_SIZE)],
				SPRITE_SIZE);
    loadGridTypes();
    mainCursor = new Cursor(systemGrid);
    
    if (!imageLoadCount){
	window.requestAnimationFrame(loop);// Start the game loop.
    }

    console.log("image load", 1-(imageLoadCount / imageLoadTotal));
}


function init() {
    buffer.canvas.width = 16*20;
    buffer.canvas.height = 16*20;//buffer.canvas.width/aspectRatio;

    window.addEventListener("resize", resize);

    initInputEvents(systemGrid);
    //window.addEventListener("keyup", controller.keyUpDown);

    resize();

    startMenu = new Menu(0, 0, buffer.canvas.width, buffer.canvas.height);

    //sprite_sheet.image.onload = onloadHandler
    map.onload = mapOnLoadHandler;
    portrait.onload = onloadHandler;
    hero_walking_sprite.onload = onloadHandler;
    enermy_walking_sprite.onload = onloadHandler;
    hero_battle_sprite.onload = onloadHandler;
    enermy_battle_sprite.onload = onloadHandler;
}


function loadScene(){
    //sprite_sheet.image.src = "pixelframe.png";// Start loading the image.
    map.src = "img/map.png";
    portrait.src = "img/hero_portrait.png";
    hero_walking_sprite.src = "img/hero_walk.png";
    enermy_walking_sprite.src = "img/enermy_walk.png";
    hero_battle_sprite.src = "img/hero_battle.png";
    enermy_battle_sprite.src = "img/enermy_battle.png";
    
    //battleState.currentState = 10;
    startMenu.globalImgLoaded = true;
    
    //heroes[0].path = systemGrid.findPath(0,0, 5, 5);
    //systemGrid.drawPath(heroes[0].path);
}

function clearScene(){
    heroes.splice(0, heroes.length);
    enermies.splice(0, enermies.length);
    battleState = null;
}

function reloadScene(){
    loadHeroes();
    loadEnermies();
    loadGridTypes();

    battleState = new BattleState(heroes, enermies);
    loadIntro();
}



init();
//loadScene();

window.requestAnimationFrame(loop);// Start the game loop.




// mis helper function


function removeFromList(list, c){
    for (let i=0; i<list.length; i++){
	if (c == list[i]){
	    list.splice(i,1);
	    return i;
	    break;
	}	
    }
    console.error("unable to remove from list", list, " ", c);
		
    return -1;
}


function getCharacterByName(list, name){
    for (let c of list){
	if (c.name == name) return c;
    }
    return null
}
