// Frank Poth 12/23/2017
// edited 2/25/2021

const WALKING_SPRITE_SIZE = [64, 48]
const PORTRAIT_SIZE = [38,38]
const BATTLE_SPRITE_SIZE = [192, 64]
const BATTLE_FRAME_SIZE = [96, 64]



const action_type_enum = {WALK:0, ATTACK:1}
const pathDebugLog = false;


class Animation{
    constructor(frame_set=null, delay=0){
	this.count = 0;// Counts the number of game cycles since the last frame change.
	this.delay = delay;// The number of game cycles to wait until the next frame change.
	this.frame = 0;// The value in the sprite sheet of the sprite image / tile to display.
	this.frame_index = 0;// The frame's index in the current animation frame set.
	this.frame_set = frame_set;// The current animation frame set that holds sprite tile values.
    }

	/* This changes the current animation frame set. For example, if the current
	   set is [0, 1], and the new set is [2, 3], it changes the set to [2, 3]. It also
	   sets the delay. */
    change(frame_set, delay){
	if (this.frame_set != frame_set) {// If the frame set is different:

	    // comment these two to syc all animation
	    // frame set[...] must all have same frame numbers
	    //this.count = 0;// Reset the count.
	    //this.frame_index = 0;// Start at the first frame in the new frame set.

	    this.frame_set = frame_set;// Set the new frame set.
	    this.frame = this.frame_set[this.frame_index];// Set the new frame value.
	}

	if (delay != null)
	    this.delay = delay;
    }

    /* Call this on each game cycle. */
    update() {

	this.count ++;// Keep track of how many cycles have passed since the last frame change.

	if (this.count >= this.delay) {// If enough cycles have passed, we change the frame.

	    this.count = 0;// Reset the count.
	    /* If the frame index is on the last value in the frame set, reset to 0.
	       If the frame index is not on the last value, just add 1 to it. */
	    this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
	    this.frame = this.frame_set[this.frame_index];// Change the current frame value.   
	}

    }

    
    
}

// action object
// contains one sprite sheet and a delay time
class Action{
    constructor(src, type, frameSets, delay){

	// 2d array of different frame set
	// for example [[0, 1][2, 3]] means
	// frame 0 1 for set 0 and frame 2 3 for set 1
	this.frameSets = frameSets;
	
	this.srcStr = src; // path to image
	this.delay = delay; // # of frames to display for each frame image 
	this.type = type;  // type of action 
    }

    loadImage(src){
	this.spriteSheetImage.src = this.srcStr;// Start loading the image.
    }
}


class Character{
    constructor(){

	// actions
	this.animation = new Animation();
	this.spriteSheetImage = null; // image object
	this.battleSheetImage = null;
	
	// display properties
	this.height;
	this.width;
	this.x=0;          this.y=0;
	this.ui_tiles=null,
	this.afterMoveActionTiles=null,
	
	
	// translation attribute
	this.i_velocity=0; this.j_velocity=0;
	this.speed = 2;
	this.targetPos=[0,0];
    
	this.path_index=0;
	this.path=[];
	this.pathFinished=false;

	
	// combat properties
	this.built_in_i = 0;
	this.isActive = true;
	this.isAlive = true;
	this.isHero = true;
	this.atkTypeMagic = false;
	this.atkRange = [1];
	this.fullHp = 10;
	this.Hp = 10;     
	this.Str = 5;
	this.Skill = 2;
	this.Luck = 1; 
	this.Def = 1;
	this.Res = 0;
	this.Mov = 3;
	this.name = "name";
	this.portrait = null;//new Image();
	this.description = "info";
	this.nickname = "nickname";
    }

    setByBuiltInI(isHero){
	this.isHero = isHero;
	this.name = ((isHero)?"hero":"enermy")+this.built_in_i;
	if(isHero){
	    let p_info = playerInfo(this.name);
	    this.fullHp = p_info[0];
	    this.Hp = this.fullHp;
	    this.Str = p_info[1];
	    this.Skill = p_info[2];
	    this.Luck = p_info[3]; 
	    this.Def = p_info[4];
	    this.Res = p_info[5];
	    this.Mov = p_info[6];
	    this.atkRange = [p_info[7]];

	    if (this.built_in_i == 2) this.atkTypeMagic = true;
	    
	    if (p_info.length > 8){ this.atkRange.push(p_info[8]); }
	}
    }


    setSize(in_w, in_h){
	this.w = in_w;
	this.h = in_h;
    }

    setPosByGridIJ(in_i, in_j, grid){
	this.x = in_i * grid.size;
	this.y = in_j * grid.size;
    }

    setDrawSize(w, h){ this.w = w; this.h=h;}

    draw(src_img, world_buffer){
	world_buffer.drawImage(this.spriteSheetImage,
			       Math.floor(this.animation.frame%4) * SPRITE_SIZE,
			       Math.floor(this.animation.frame/4) *SPRITE_SIZE
			       + this.built_in_i*WALKING_SPRITE_SIZE[1],
			       this.w, this.h,
			       Math.floor(this.x), Math.floor(this.y),
			       systemGrid.size, systemGrid.size);

    }

    drawPortrait(x, y, w, h, world_buffer){
	world_buffer.drawImage(this.portrait,
			       this.built_in_i*PORTRAIT_SIZE[0], 0,
			       PORTRAIT_SIZE[0], PORTRAIT_SIZE[0],
			       Math.floor(x), Math.floor(y), w, h);
    }

    drawInfoFull(world_buffer, vport){

	let offset_x = 5;
	let offset_y = 5;
	
	let draw_w = vport.w*0.5;
	let draw_h = vport.h*0.75;
	
	let draw_x = vport.startTilePos[0] + offset_x + (vport.w-draw_w)/2;
	let draw_y = vport.startTilePos[1] + offset_y + (vport.h-draw_h)/2;

	
	// back ground rect
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(0,0,255,0.5)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();


	let texts = [getDisplayName(this.name),
		     "Hp  "+this.Hp,
		     "力量 "+this.Str,
		     "技艺 "+this.Skill,
		     "守备 "+this.Def,
		     "抗性 "+this.Res,
		     "运气 "+this.Luck,
		     "移动 "+this.Mov];

	let texts2 = ["",
		     " 生命值",
		     " 影响攻击威力",
		     " 影响命中躲避",
		     " 物理防御",
		     " 法术抗性",
		     " 影响各种概率",
		     " 移动范围"];
	
	let itemHeight = (draw_h - offset_y*2)/texts.length;
	
	// text
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	for (let i in texts){
	    world_buffer.fillText(texts[i],
				  draw_x + offset_x,
				  draw_y + offset_y +systemGrid.size*0.8 +i*itemHeight);
	    world_buffer.fillText(texts2[i],
				  draw_x + offset_x + systemGrid.size*2.5,
				  draw_y + offset_y +systemGrid.size*0.8 +i*itemHeight);
	    
	}
	
    }


    drawBattle(x, y, f, world_buffer){
	world_buffer.drawImage(this.battleSheetImage,
			       f*BATTLE_FRAME_SIZE[0],
			       this.built_in_i * BATTLE_SPRITE_SIZE[1],
			       BATTLE_FRAME_SIZE[0],
			       BATTLE_FRAME_SIZE[1],
			       x, y, BATTLE_FRAME_SIZE[0], BATTLE_FRAME_SIZE[1]
			      );
    }

    
    addAction(src, type, frameSets, delay){
	this.actions.push(new Action(src, type, frameSets, delay));
    }

    setMoveTarget(target_x, target_y){
	this.targetPos[0] = target_x;
	this.targetPos[1] = target_y;
    }

    setPos(in_x, in_y){
	// reset character pos
	this.x = in_x;
	this.y = in_y;
    }


    moveToNextTileInPath(){
	let pathList = this.path;
	let currentIJ =  this.calculateIJ();
	if (pathList != null){
	    if ((pathList.length > 0) && (this.path_index >= 0)){
		playWalkSound();
		let nextTarget = [pathList[this.path_index].i, pathList[this.path_index].j];
		if (pathDebugLog)
		    console.log("got position "+this.path_index
				+" v="+this.i_velocity +" "+this.j_velocity
				+" target "+nextTarget[0]+" "+nextTarget[1]
				+" current "+currentIJ[0]+" "+currentIJ[1]);
		this.i_velocity = nextTarget[0] - currentIJ[0];
		this.j_velocity = nextTarget[1] - currentIJ[1];
		this.targetPos[0] = nextTarget[0]*systemGrid.size;
		this.targetPos[1] = nextTarget[1]*systemGrid.size;
		this.path_index --;

		if (pathDebugLog)
		    console.log("to position "+this.path_index
				+" v="+this.i_velocity +" "+this.j_velocity
				+" target "+nextTarget[0]+" "+nextTarget[1]
				+" current "+currentIJ[0]+" "+currentIJ[1]);;
	    }
	}
    }

    calculateIJ(){
	return [Math.floor(this.x / systemGrid.size),
		Math.floor(this.y / systemGrid.size)];	
    }

    setUITiles(sysGrid){
	let currentIJ = this.calculateIJ();
	this.ui_tiles = sysGrid.getUITiles( currentIJ[0], currentIJ[1],
					    this.Mov,this.atkRange);
    }

    onFinishPath(){

	let currentIJ =  this.calculateIJ();
	if (pathDebugLog)
	    console.log("finish path at position "+this.path_index
			+" v="+this.i_velocity +" "+this.j_velocity
			+" current "+currentIJ[0]+" "+currentIJ[1]);
	// init ui tiles 	
	if (this.afterMoveActionTiles == null )this.afterMoveActionTiles = new Set();
	else this.afterMoveActionTiles.clear();
	systemGrid.addNodeToSetAtRange(this.atkRange,
				       systemGrid.nodes[currentIJ[0]][currentIJ[1]],
				       this.afterMoveActionTiles);
	// chanege state
	this.pathFinished = true;
	// finish path release key input
	//keyboardInputRelease(this.name+"CH_WALKING"); 
    }


    initPathToMoveByTargetPos(){
	let currentIJ = this.calculateIJ();
	let targetPosIJ = systemGrid.xyToIJ(this.targetPos);
	
	// calcuate UI tiles if nonexist
	if (this.ui_tiles == null)
	    this.ui_tiles = systemGrid.getUITiles( currentIJ[0],
						   currentIJ[1],
						   this.Mov,
						   this.atkRange);
	// move only when targetPos is within movable UI tiles
	// and is not there already
	if (getMHTDist(currentIJ[0], currentIJ[1],
		       targetPosIJ[0], targetPosIJ[1]) == 0){
	    if(pathDebugLog)
		console.log("target at current position");
	    this.onFinishPath()
	}else if (this.ui_tiles[0].has(systemGrid.nodes[targetPosIJ[0]][targetPosIJ[1]])) {
	    if (pathDebugLog)
		console.log("calculating path from character ["
			    +currentIJ[0] + " "+currentIJ[1]
			    +"] to target ["
			    + targetPosIJ[0]+" "+targetPosIJ[1]+"]");
	    // update grids manually for possible painting
	    // shouldn't need this other than this debug test
	    
	    //systemGrid.calculateNeighborNodes();
	    this.path = systemGrid.findPath(currentIJ[0], currentIJ[1],
					    targetPosIJ[0], targetPosIJ[1]);
	    if (this.path != null){
		if (this.path.length > 1){
		    this.path_index = this.path.length - 2;
		    let nextTarget = [this.path[this.path_index].i,
				      this.path[this.path_index].j];
		    this.i_velocity = nextTarget[0] - currentIJ[0];
		    this.j_velocity = nextTarget[1] - currentIJ[1];
		    this.targetPos[0] = nextTarget[0]*systemGrid.size;
		    this.targetPos[1] = nextTarget[1]*systemGrid.size;
		    this.path_index--;
		    if (pathDebugLog){
			console.log("go path with v = "
				    +this.i_velocity+" "+ this.j_velocity
				    +" i="+this.path_index
				    +" final des="
				    +this.path[0].i+" "+this.path.j);
			console.log(this.path);
		    }
		}
		
	    }else return false; //keyboardInputRelease(this.name+"CH_WALKING");
	    //invalid path, release key input
	    
	}else return false; 
	// not within movable range, release key input
	return true;
    }

    standStill(){
	this.animation.change(frame_sets[4]);    
    }

    standInactive(){
	this.animation.change(frame_sets[5]);
    }
    
    update(){
	// always update display
	this.animation.update();

	// if change requested
	// update object information 
	if(this.pathFinished) return;

	// if arrive target position
	if ((getLineDistSq(this.x, this.y, this.targetPos[0], this.targetPos[1])<= 0.005*0.0005 )
	    && (this.i_velocity || this.j_velocity)){
	    // clear velocity and set to exact pos
	    this.i_velocity = 0;
	    this.x = this.targetPos[0];
	    
	    this.j_velocity = 0;
	    this.y = this.targetPos[1];

	    // finish path or move to next node in path
	    if (this.path_index == -1){
		this.onFinishPath();
		// if arrived set to front
		//this.animation.change(sprite_sheet.frame_sets[4]);
	    }else{
		this.moveToNextTileInPath();
	    }
	}else{
	

	    // left right moving
	    if (this.i_velocity != 0){
		if (Math.abs(this.x - this.targetPos[0]) > 0.0005){
		    let facing = 2; // left
		    if (this.i_velocity > 0) facing = 3; // right

		    // set animation
		    this.animation.change(frame_sets[facing]);
		    this.x += this.i_velocity*CHARACTER_SPEED*systemGrid.size/60;;
		}
	    }
	    // up down moving
	    else if (this.j_velocity != 0){
		if (Math.abs(this.y - this.targetPos[1]) > 0.0005){
		    let facing = 1; // up
		    if (this.j_velocity > 0) facing = 0; // down

		    // set animation
		    this.animation.change(frame_sets[facing]);
		    this.y += this.j_velocity*CHARACTER_SPEED*systemGrid.size/60;
		}
	    }
	}
    }





    // battle functionalities

    getDamageTo(c){
	let damage = Math.max(this.Str - c.Def, 0);
	if (this.atkTypeMagic)
	    damage = Math.max(this.Str - c.Res, 0);
	return damage;
    }

    getHitRateTo(c){
	let hitRate = Math.min(Math.max(this.Skill - c.Skill)*10 + 70, 100);
	return hitRate;
    }

    getIfHit(c){
	let rate = this.getHitRateTo(c);
	let randNum = Math.random();
	console.log(randNum*100, rate, "?", (randNum * 100) < rate);
	return ((randNum * 100) < rate);
    }
    
};


