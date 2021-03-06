
class BattleState{
    constructor(h_list, e_list){
	// 0: display map & selected enemery ui
	//    ->1 select player character
	//    ->8 no player character or enermy
	// 1: move selected player character
	//    ->0 cancel
	//    ->2 select movable ui tile
	
	// insert ui stuff states [2,3,4] later

	// 2: pre act menu
	//    ->5 select attack
	//    ->0 select wait
	//    ->1 cancel
	
	// 5: execute selected player character
	//    ->2 cancel
	//    ->6 select within tmp action ui tile

	// 6: play animation
	//    remove if either side hp <= 0
	//    all character moved? ->0:7
	
	// 7: for each enermy
	//        calcalute ui tiles
	//        find closest player character in act ui tiles
	//        get one moveable ui tile + pathfinding
	//        go along path to that tile
	//        play animation
	//    ->0 all enermy moved
	this.list = {DISPLAY:0, MOVE:1, PRE_ACT:2,
		     EXECUTE:5, ON_BATTLE:6,
		     ENERMY_TURN:7, INTRO:8, FIN:9};
	
	this.currentState = this.list.INTRO;
	this.currentCharacter = null;
	this.currentCharacterIsHero = false;
	this.turnCount = 0;
	
	this.stateInitialized = false;
	this.needUpdateOnEnterKeyEvent = false;
	this.needUpdateOnShiftKeyEvent = false;
	this.needUpdateOnWASDEvent = false;
	this.cursorPosInEvent = [];


	// for tutorial
	this.tutorialOnInDisplay = true;
	this.tutorialOnInMove = true;
	this.tutorialOnInPreAct = true;
	this.tutorialOnInExeute = true;
	this.tutorialDisplayText = ["display help", "aaaaaaaaaaa"];
	this.tutorialMoveText = ["move help"];
	this.tutorialPreActText = ["pre act help"];
	this.tutorialExecuteText = ["execute help"];
	
	// for DISPLAY state
	// chech if any hero alive, enermy alive, hero active, enemry active
	this.activeHeroCount = h_list.length;
	this.activeEnermyCount = 0;
	this.aliveHeroCount = h_list.length;
	this.aliveEnermyCount = e_list.length;
	this.displayCharacter = null;
	this.fullInfoOn = false;
	
	// for MOVE state
	// store original position node
	this.preMoveCharacterIJ = [0, 0];
	
	// for PRE_ACT state
	// store all possible actions
	this.actionList = {ATK:0, WAIT:1};
	this.actionListStrs = ["atk", "wait"];
	this.currentActionIndex = 0;
	this.actionPanelTexts = ["hp", "dmg", "hit"];
	
	// for EXECUTE state
	// store all possible target characters
	// in action tiles range
	this.targetList = [];
	this.currentTargetIndex = 0;
	this.targetEnermy = null;
	this.targetEnermyCounter = true;

	// for ON_BATTLE state
	this.onBattleFrameCount = 0;
	this.onBattleMyTurnCount = 20;
	this.onBattleOppoTurnCount = this.onBattleMyTurnCount + 120;
	this.onBattleEndCount = this.onBattleOppoTurnCount + 120;
	this.onBattleQuitCount = this.onBattleEndCount + 120;
	this.onBattleCharacters = null; 
	this.onBattleDamage = [0,0];
	this.onBattleHit = [true, true];
	this.onBattleAttack = [true, true];

	// for ENERMY_TURN state
	this.enermyTurnEnermyIndex = 0;
	this.enermyTurnCurrent = null;
	this.enermyTurnToAtk = false;
	this.enermyTurnDisplayFCount = 0;


	// for INTRO/FIN state
	this.instr = null;

	// win/lose
	this.lose = false;
	this.win = false;
    }

    inputWASDEventsForCursor(key, str){
	if(key == "a"){
	    if (keyinputDebugLog) console.log("left a key pressed in"+ str)
	    if (mainCursor.moveLeft(systemGrid))
		keyboardInputOccupy("mainCursorMove");
	    return true;
	} else if (key == "d"){
	    if (keyinputDebugLog) console.log("right d key pressed in"+str)
	    if(mainCursor.moveRight(systemGrid))
		keyboardInputOccupy("mainCursorMove");
	    return true;
	}else if (key == "w"){
	    if (keyinputDebugLog) console.log("up w key pressed in"+str)
	    if (mainCursor.moveUp(systemGrid))
		keyboardInputOccupy("mainCursorMove");
	    return true;
	}else if (key == "s"){
	    if (keyinputDebugLog) console.log("down s key pressed in"+str)
	    if (mainCursor.moveDown(systemGrid))
		keyboardInputOccupy("mainCursorMove");
	    return true;
	}
	return false;
    }

    inputWASDEventsForTargetList(key, str){
	if(key == "a"){
	    if (keyinputDebugLog) console.log("left a key pressed in"+ str)
	    this.currentTargetIndex = (this.currentTargetIndex == 0)? this.targetList.length - 1 : this.currentTargetIndex-1 ;
	    return true;
	} else if (key == "d"){
	    if (keyinputDebugLog) console.log("right d key pressed in"+str)
	    this.currentTargetIndex = ((this.currentTargetIndex+1) == this.targetList.length)? 0 : this.currentTargetIndex+1;
	    return true;
	}else if (key == "s"){
	    if (keyinputDebugLog) console.log("down s key pressed in"+str)
	    this.currentTargetIndex = (this.currentTargetIndex == 0)? this.targetList.length - 1 : this.currentTargetIndex-1 ;
	    return true;
	}else if (key == "w"){
	    if (keyinputDebugLog) console.log("up w key pressed in"+str)
	    this.currentTargetIndex = ((this.currentTargetIndex+1) == this.targetList.length)? 0 : this.currentTargetIndex+1;
	    return true;
	}
	return false;
	    
    }

    inputWSEventsForPreActList(key, str){
	if (key == "s"){
	    if (keyinputDebugLog) console.log("down s key pressed in"+str)
	    this.currentActionIndex = (this.currentActionIndex == 0)? this.actionListStrs.length - 1 : this.currentActionIndex-1 ;
	    // update render and primitive only
	    // no need to lock input
	    //keyboardInputOccupy();
	    return true;
	}else if (key == "w"){
	    if (keyinputDebugLog) console.log("up w key pressed in"+str)
	    this.currentActionIndex = ((this.currentActionIndex+1) == this.actionListStrs.length)? 0 : this.currentActionIndex+1;
	    //keyboardInputOccupy();
	    return true;
	}
	return false;
    }

    
    enterNewState(s){
	if (battleStateDebugLogEnterNewState)
	    console.log(this.getStateStr() +" to "+this.getStateStrByVal(s));

	this.currentState = s;
	this.stateInitialized = false;
	
    }

    enterOppoTurnState(s){
	for (let h of heroes){
	    h.isActive = true;
	    h.standStill();
	}
	for (let e of enermies){
	    e.isActive = true;
	    e.standStill();
	}
	if (s == this.list.ENERMY_TURN){
	    
	    // paint character grids
	    //systemGrid.paintGridsByList([enermies, heroes],
	//				[tile_type_enum.PASSING_CH,
	//				 tile_type_enum.NONPASSING_CH]);
	    
	    this.enermyTurnStateClear();
	}
	this.enterNewState(s);

    }

    endThisCharacter(character, finalGridType){
	if (battleStateDebugLogEnterNewState)
	    console.log("end character at", systemGrid.xyToIJ([character.x,
							       character.y]));
	
	character.isActive = false;
	// clear character
	character.pathFinished = false;
	character.path.splice(0, character.path.length);
	character.ui_tiles = null;
	character.afterMoveActionTiles = null;

	let currentIJ = character.calculateIJ();
	// TODO set to prev type on map
	systemGrid.setGridType(this.preMoveCharacterIJ[0],
			       this.preMoveCharacterIJ[1], tile_type_enum.WALKABLE);
	systemGrid.setGridType(currentIJ[0], currentIJ[1], finalGridType);

	if (battleStateDebugLog) console.log("end character from",
					     this.preMoveCharacterIJ[0],
					     this.preMoveCharacterIJ[1],
					     "to", currentIJ[0], currentIJ[1]);

    }

    isDisplay(){return this.currentState == this.list.DISPLAY;}
    isMove(){return this.currentState == this.list.MOVE;}
    isPreAct(){	return this.currentState == this.list.PRE_ACT;}
    isExecute(){ return this.currentState == this.list.EXECUTE;}
    isOnBattle(){ return this.currentState == this.list.ON_BATTLE;}
    isEnermyTurn() { return this.currentState == this.list.ENERMY_TURN;}
    isFin(){return this.currentState == this.list.FIN;}
    isIntro(){return this.currentState == this.list.INTRO;}
    
    getStateStr(){
	if (this.isDisplay()) return "DISPLAY";
	if (this.isMove()) return "MOVE";
	if (this.isPreAct()) return "PRE_ACT"
	if (this.isExecute()) return "EXECUTE";
	if (this.isOnBattle()) return "ON_BATTLE";
	if (this.isEnermyTurn()) return "ENERMY_TURN";
	if (this.isFin()) return "FIN";
	if (this.isIntro()) return "INTRO";
    }

    getStateStrByVal(v){
	if (v == this.list.DISPLAY) return "DISPLAY";
	if (v == this.list.MOVE) return "MOVE";
	if (v == this.list.PRE_ACT) return "PRE_ACT";
	if (v == this.list.EXECUTE) return "EXECUTE";
	if (v == this.list.ON_BATTLE) return "ON_BATTLE";
	if (v == this.list.ENERMY_TURN) return "ENERMY_TURN";
	if (v == this.list.FIN) return "FIN";
	if (v == this.list.INTRO) return "INTRO";
    }

    getEnterKeyCode(){return this.getStateStr()+"Enter";}
    getShiftKeyCode(){return this.getStateStr()+"Shift";}
    getWASDKeyKeyCode(){return this.getStateStr()+"WASD";}
    
    getHeroHere(l){
	for (let h of heroes){
	    if ( (systemGrid.xToI(h.x) == systemGrid.xToI(l[0])) &&
		 (systemGrid.yToJ(h.y) == systemGrid.yToJ(l[1])) )
		return h;

	}
	return null;
    }

    getEnermyHere(l){
	for (let e of enermies){
	    if ( (systemGrid.xToI(e.x) == systemGrid.xToI(l[0])) &&
		 (systemGrid.yToJ(e.y) == systemGrid.yToJ(l[1])) )
		return e;

	}
	return null;
    }

    allInactiveInList(list){
	for (let c of list)
	    if ( c.isActive )return false;
	return true;	
    }

    getNextActiveInList(list){
	for (let c of list)
	    if (c.isActive) return c;
	return null;
    }
    
    errorOnNoCurrentHero(){
	if (!this.currentCharacter)
	    console.error(this.getStateStr+": no character");
	else if(!this.currentCharacterIsHero)
	    console.error(this.getStateStr+ ": current character at"
			  + getStrXYtoIJ(this.currentCharacter.x,
					 this.currentCharacter.y)
			  +" is not a hero");
    }
    
    errorOnCurrentNotEnermy(){
	if (!this.currentCharacter)
	    console.error("no character");
	else if(this.currentCharacterIsHero)
	    console.error("current character at"
			  + getStrXYtoIJ(this.currentCharacter.x,
					 this.currentCharacter.y)
			  +" is not a enermy");
    }


    
    drawUIToSide(world_buffer, cursor, vport){
	let v_x = vport.startTilePos[0];
	let v_w = vport.w;

	let draw_x = 0;
	let draw_y = vport.startTilePos[1]+systemGrid.size;
	let draw_w = systemGrid.size*2;
	let draw_h = systemGrid.size*this.actionListStrs.length;
	
	if (cursor.x > v_x + v_w/2) // cursor on right, draw on left
	    draw_x = v_x + systemGrid.size;
	else
	    draw_x = v_x + (v_w - systemGrid.size - draw_w);
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(0,0,255,0.5)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();

	let index = this.currentActionIndex;
	let offset_x = 2;
	let offset_y = 2;
	let itemHeight = (draw_h - offset_y*2) / this.actionListStrs.length;
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(0,255,255,0.8)";
	world_buffer.fillRect(draw_x + offset_x,
			      draw_y + itemHeight*index + offset_y,
			      draw_w - offset_y*2,
			      itemHeight);
	world_buffer.stroke();

	for (let i=0; i<this.actionListStrs.length; i++){
	    world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	    world_buffer.fillStyle = 'white';
	    world_buffer.fillText(this.actionListStrs[i],
				  draw_x + offset_x,
				  draw_y + itemHeight*(i+1) -1);
	}
    }

    drawInfoToside(world_buffer, cursor, vport){
	if (!this.displayCharacter) return;

	let c = this.displayCharacter;

	let v_x = vport.startTilePos[0];
	let v_y = vport.startTilePos[1]
	let v_w = vport.w;
	let v_h = vport.h;

	let draw_x = 0;
	let draw_y = vport.startTilePos[1]+systemGrid.size*0.5;
	let draw_w = systemGrid.size*6;
	let draw_h = systemGrid.size*3;
	
	if (cursor.x >= v_x + v_w/2 - systemGrid.size/2) // cursor on right, draw on left
	    draw_x = v_x + systemGrid.size*0.5;
	else
	    draw_x = v_x + (v_w - systemGrid.size*0.5 - draw_w);

	if (cursor.y >= v_y + v_h/2) // cursor on bottom, draw on top
	    draw_y = v_y +systemGrid.size*0.5;
	else
	    draw_y = v_y + (v_h - systemGrid.size*0.5 - draw_h);

	
	world_buffer.beginPath();
	
	if (c.isHero) world_buffer.fillStyle = "rgba(0,0,150,0.5)";
	else world_buffer.fillStyle = "rgba(150,0,0,0.5)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();

	let offset_x = systemGrid.size*2.8;
	let offset_y = systemGrid.size*2.5;	
		

	let hpFullWidth = draw_w/2 - 2;
	let hpWidth = hpFullWidth * c.Hp/c.fullHp;
	let hpHeight = 5;
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,255,150,1)";
	world_buffer.fillRect(draw_x+offset_x, draw_y+offset_y , hpWidth, hpHeight-2);
	world_buffer.stroke();
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,150,150,1)";
	world_buffer.fillRect(draw_x+offset_x+hpWidth, draw_y+offset_y , hpFullWidth-hpWidth, hpHeight);
	world_buffer.stroke();

	// portrait
	
	world_buffer.beginPath();
	if (c.isHero) world_buffer.fillStyle = "rgba(150,150,250,1)";
	else world_buffer.fillStyle = "rgba(255,150,150,1)";
	world_buffer.fillRect(draw_x+5, draw_y+5 , draw_h-10, draw_h-10);
	world_buffer.stroke();
	if (c.portrait != null)
	    c.drawPortrait(draw_x+5, draw_y+5 , draw_h-10, draw_h-10, buffer)
	
	
	// hp text
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	world_buffer.fillText("HP "+c.Hp+"/"+c.fullHp,
			      draw_x + offset_x ,
			      draw_y  + offset_y - 2);
	// name text
	let txt = world_buffer.measureText(getDisplayName(c.name));
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	world_buffer.fillText(getDisplayName(c.name),
			      draw_x + offset_x + (draw_w-offset_x)/3- txt.width/2 ,
			      draw_y + offset_y - systemGrid.size - 2);


    }

    drawPanelToSide(world_buffer, cursor, vport){
	if (!this.targetList.length) return;
	if (!this.targetEnermy) return;
	
	let v_x = vport.startTilePos[0];
	let v_w = vport.w;

	let draw_x = 0;
	let draw_y = vport.startTilePos[1]+systemGrid.size * 0.5;
	let draw_w = systemGrid.size*4;
	let draw_h = systemGrid.size*5;
	
	let offset_x = 2;
	let offset_y = 2;
	let overlay = 2;
	
	if (cursor.x > v_x + v_w/2) // cursor on right, draw on left
	    draw_x = v_x + systemGrid.size;
	else
	    draw_x = v_x + (v_w - systemGrid.size - draw_w);
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(0,0,255,0.5)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();

	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(150,150,255,1.0)";
	world_buffer.fillRect(draw_x+offset_x, draw_y+offset_y,
			      draw_w-offset_x*2, (draw_h-offset_y*2)/5);
	world_buffer.stroke();
	world_buffer.beginPath();
	world_buffer.fillRect(draw_x+offset_x+(draw_w-offset_x*2)/3*2 +2,
			      draw_y+offset_y + (draw_h - 2*offset_y)/5 - overlay,
			      (draw_w - 2*offset_x)/3 -2,
			      (draw_h - offset_y*2)/5*3 + overlay);
	world_buffer.stroke();

	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,150,150,1.0)";
	world_buffer.fillRect(draw_x+offset_x,
			      draw_y+offset_y+(draw_h-offset_y*2)/5*4 + 2,
			      draw_w-offset_x*2,
			      (draw_h-offset_y*2)/5 - 2);
	world_buffer.stroke();
	world_buffer.beginPath();
	world_buffer.fillRect(draw_x+offset_x,
			      draw_y+offset_y + (draw_h - 2*offset_y)/5 + overlay,
			      (draw_w - 2*offset_x)/3 -2,
			      (draw_h - offset_y*2)/5*3 + 2);
	world_buffer.stroke();

	
	let itemHeight = (draw_h - offset_y*2) / 5;

	let c1 = this.currentCharacter;
	let c2 = this.targetEnermy;
	//console.log(this.currentTargetIndex);
	
	
	let textList = [getDisplayName(c1.name), getDisplayName(c2.name),
			c1.Hp, c2.Hp,
			c1.getDamageTo(c2),
			c2.getDamageTo(c1),
			c1.getHitRateTo(c2),
			c2.getHitRateTo(c1)];
	if (!this.targetEnermyCounter){
	    textList[5] = "-";
	    textList[7] = "-";
	}
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	
	world_buffer.fillText(textList[1],
			      draw_x + offset_x + 1,
			      draw_y + itemHeight*(textList.length/2+1) - 3);
	world_buffer.fillText(textList[0],
			      draw_x + draw_w - offset_x*2 - world_buffer.measureText(textList[0]).width,
			      draw_y + itemHeight - 2);
	
	for (let i=1; i<textList.length/2; i++){
	    let txtWdith0 = world_buffer.measureText(textList[i*2]).width; 
	    let txtWdith1 = world_buffer.measureText(textList[i*2+1]).width; 
	    let txtWidth_ = world_buffer.measureText(this.actionPanelTexts[i-1]).width;
	    
	    world_buffer.fillText(textList[i*2+1],
				  draw_x + offset_x +systemGrid.size/2 - txtWdith1/2,
				  draw_y + itemHeight*(i+1));
	    
	    world_buffer.fillText(this.actionPanelTexts[i-1],
				  draw_x + draw_w/2 - txtWidth_/2,
				  draw_y + itemHeight*(i+1));


	    world_buffer.fillText(textList[i*2],
				  draw_x + draw_w - offset_x*2 - systemGrid.size/2 - txtWdith0/2 ,
				  draw_y + itemHeight*(i+1));
	}
    }

    drawCenterMessage(world_buffer, vport, strs, offset_y_in=0){

	let offset_x = 10;
	let offset_y = 10;
	
	let itemHeight = 15;
	
	let draw_w = vport.w*0.7;
	let draw_h = itemHeight*strs.length + offset_y*2;
	
	let draw_x = vport.startTilePos[0] + (vport.w-draw_w)/2;
	let draw_y = vport.startTilePos[1] + (vport.h-draw_h)/2 - offset_y_in;

	
	// back ground rect
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(0,0,255,0.5)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();


	
	// text
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	for (let i in strs)
	    world_buffer.fillText(strs[i],
				  draw_x + offset_x,
				  draw_y + offset_y + systemGrid.size/2
				  +i*itemHeight);
	
    }


    drawDialog(world_buffer, cursor, vport, str, portrait_c=null){

	let offset_x = 2;
	let offset_y = 2;
	
	let draw_w = vport.w - offset_x*2;
	let draw_h = systemGrid.size*3 - offset_y*2;
	
	let draw_x = vport.startTilePos[0] + offset_x;
	let draw_y = vport.startTilePos[1] + vport.h - offset_y - draw_h;

	   	
	// back ground rect
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(0,0,255,0.5)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();
	 

	if (portrait_c == null){
	    // text
	    world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	    world_buffer.fillStyle = 'white';
	    world_buffer.fillText(str,
				  draw_x +draw_h,
				  draw_y + draw_h - systemGrid.size*1);
	}else{
	    
	    // portrait
	    world_buffer.beginPath();
	    world_buffer.fillStyle = "rgba(150,150,250,1)";
	    world_buffer.fillRect(draw_x+5, draw_y+5 , draw_h-10, draw_h-10);
	    world_buffer.stroke();
	    portrait_c.drawPortrait(draw_x+5,draw_y+5, draw_h-10,draw_h-10, buffer);

	    world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	    world_buffer.fillStyle = 'white';
	    world_buffer.fillText(getDisplayName(portrait_c.name),
				  draw_x + draw_h,
				  draw_y + draw_h - systemGrid.size*1.8);	    
	    world_buffer.fillText(str,
				  draw_x + draw_h,
				  draw_y + draw_h - systemGrid.size*1);
	}
	
    }


    drawBattleScene(world_buffer, cursor, vport){
	if (!this.onBattleCharacters) return;
	if (this.onBattleCharacters.length != 2) return;
	
	let v_x = vport.startTilePos[0];
	let v_w = vport.w;

	let draw_x = v_x;
	let draw_y = vport.startTilePos[1]+systemGrid.size*6;
	let draw_w = systemGrid.size*2.5;
	let draw_h = systemGrid.size*2;
	
	let offset_x = 2;
	let offset_y = 2;
	let overlay = 2;
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(100,100,100,0.5)";
	world_buffer.fillRect(vport.startTilePos[0], vport.startTilePos[1],
			      vport.w, vport.h);
	world_buffer.stroke();

	
	let c1 = this.onBattleCharacters[0];
	let c2 = this.onBattleCharacters[1];
	if (!c1.isHero){ // set hero to be c1 on right
	    c2 = this.onBattleCharacters[0];
	    c1 = this.onBattleCharacters[1];
	}

	// left side enermy
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,150,150,1.0)";
	world_buffer.fillRect(draw_x, draw_y, draw_w, draw_h);
	world_buffer.stroke();
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(180,50,50,1.0)";
	world_buffer.fillRect(draw_x, draw_y+draw_h, vport.w/2, draw_h);
	world_buffer.stroke();

	// hp
	let hpFullWidth = systemGrid.size*4 - 2;
	let hpWidth = hpFullWidth * c2.Hp/c2.fullHp;
	let hpHeight = 5;
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,255,150,1)";
	world_buffer.fillRect(draw_x + offset_x + systemGrid.size,
			      draw_y + offset_y + draw_h+systemGrid.size ,
			      hpWidth, hpHeight-2);
	world_buffer.stroke();
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,150,150,1)";
	world_buffer.fillRect(draw_x + offset_x + hpWidth + systemGrid.size,
			      draw_y + offset_y + draw_h+systemGrid.size ,
			      hpFullWidth-hpWidth, hpHeight);
	world_buffer.stroke();	
	
	// hp text
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	world_buffer.fillText("HP "+c2.Hp+"/"+c2.fullHp,
			      draw_x + offset_x +systemGrid.size,
			      draw_y + draw_h+offset_y - 2 + systemGrid.size*0.8);
	
	// right side
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(150,150,255,1.0)";
	world_buffer.fillRect(draw_x+v_w-draw_w, draw_y, draw_w, draw_h);
	world_buffer.stroke();
	world_buffer.fillStyle = "rgba(50,50,180,1.0)";
	world_buffer.fillRect(draw_x+v_w-v_w/2, draw_y+draw_h, v_w/2, draw_h);
	world_buffer.stroke();

	// hp
	hpWidth = hpFullWidth * c1.Hp/c1.fullHp;
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,255,150,1)";
	world_buffer.fillRect(draw_x + offset_x + systemGrid.size + v_w/2,
			      draw_y + offset_y + draw_h+systemGrid.size ,
			      hpWidth, hpHeight-2);
	world_buffer.stroke();
	
	world_buffer.beginPath();
	world_buffer.fillStyle = "rgba(255,150,150,1)";
	world_buffer.fillRect(draw_x + offset_x + hpWidth + systemGrid.size + v_w/2,
			      draw_y + offset_y + draw_h+systemGrid.size ,
			      hpFullWidth-hpWidth, hpHeight);
	world_buffer.stroke();	
	
	// hp text
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	world_buffer.fillText("HP "+c1.Hp+"/"+c1.fullHp,
			      draw_x + offset_x +systemGrid.size + v_w/2,
			      draw_y + draw_h+offset_y - 2 + systemGrid.size*0.8);
	

	// info text
	let textList = [c1.getDamageTo(c2),
			c2.getDamageTo(c1),
			c1.getHitRateTo(c2),
			c2.getHitRateTo(c1)];
	let infoTextList = ["威力", "命中"];
	if (!this.targetEnermyCounter){
	    textList[1] = "-";
	    textList[3] = "-";
	}
	
	let itemHeight = (draw_h - offset_y*2) / (textList.length/2);
	world_buffer.font = world_buffer.font.replace(/\d+px/, "10px");
	world_buffer.fillStyle = 'white';
	
	for (let i=0; i<textList.length/2; i++){
	    let txtWdith0 = world_buffer.measureText(textList[i*2]).width; 
	    let txtWdith1 = world_buffer.measureText(textList[i*2+1]).width; 
	    world_buffer.fillText(infoTextList[i],
				  draw_x + offset_x +systemGrid.size/8,
				  draw_y + itemHeight*(i+1));
	    world_buffer.fillText(textList[i*2+1],
				  draw_x + offset_x+systemGrid.size*1.9-txtWdith1/2,
				  draw_y + itemHeight*(i+1));
	    
	    world_buffer.fillText(infoTextList[i],
				  draw_x + v_w-draw_w+offset_x +systemGrid.size/8,
				  draw_y + itemHeight*(i+1));
	    world_buffer.fillText(textList[i*2],
				  draw_x + v_w - offset_x*2 - systemGrid.size/4 - txtWdith0/2 ,
				  draw_y + itemHeight*(i+1));
	}


	// characters
	let f0 = 0;
	let f1 = 0;
	if (this.onBattleInC0TurnAttack()){ // draw c0 on top
	    f0 = 1;
	    this.onBattleCharacters[1].drawBattle(vport.startTilePos[0] + v_w/2 - BATTLE_FRAME_SIZE[0]/2,
						  vport.startTilePos[1] + systemGrid.size*3,
						  f1, world_buffer);
	    this.onBattleCharacters[0].drawBattle(vport.startTilePos[0] + v_w/2 - BATTLE_FRAME_SIZE[0]/2,
						  vport.startTilePos[1] + systemGrid.size*3,
						  f0, world_buffer);
	}else{ // draw c1 on top
	    if (this.onBattleInC1TurnAttack() && this.onBattleAttack[1])
		f1 = 1;
	    this.onBattleCharacters[0].drawBattle(vport.startTilePos[0] + v_w/2 - BATTLE_FRAME_SIZE[0]/2,
						  vport.startTilePos[1] + systemGrid.size*3,
						  f0, world_buffer);
	    this.onBattleCharacters[1].drawBattle(vport.startTilePos[0] + v_w/2 - BATTLE_FRAME_SIZE[0]/2,
						  vport.startTilePos[1] + systemGrid.size*3,
						  f1, world_buffer);
	}
    }

    tutorialSetTo(a){
	this.tutorialOnInDisplay = a;
	this.tutorialOnInPreAct = a;
	this.tutorialOnInMove = a;
	this.tutorialOnInExeute = a;

    }

    tutorialUpdate(cond){
	if ((!cond)) return false;
	
	if (this.needUpdateOnEnterKeyEvent){
	    this.needUpdateOnEnterKeyEvent = false;
	    if (!isKeyboardInputReady())
		keyboardInputRelease(this.getEnterKeyCode());

	    if (this.isDisplay())
		this.tutorialOnInDisplay = false;
	    if (this.isMove())
		this.tutorialOnInMove = false;
	    if (this.isPreAct())
		this.tutorialOnInPreAct = false;
	    if (this.isExecute())
		this.tutorialOnInExeute = false;
	    return true;
	    
	}else if(this.needUpdateOnShiftKeyEvent){
	    this.needUpdateOnShiftKeyEvent = false;
	    if (!isKeyboardInputReady())
		keyboardInputRelease(this.getShiftKeyCode());
	}else if (this.needUpdateOnWASDEvent){
	    this.needUpdateOnWASDEvent = false;
	    if (!isKeyboardInputReady())
		keyboardInputRelease(lock.code);
	}
	
	return false;
    }


    //
    // START ALL STATE FUNCTION DEFINE
    //

    
    displayStateInputEvents(key){

	let inputForCursor = false;
	if (!this.tutorialOnInDisplay)
	    inputForCursor = this.inputWASDEventsForCursor(key, "DISPLAY");
	
	if (!inputForCursor){
	    switch (key) {
	    case "Enter":
		this.cursorPosInEvent = [mainCursor.x, mainCursor.y]; 
		this.needUpdateOnEnterKeyEvent = true;
		keyboardInputOccupy(this.getEnterKeyCode());
		break;
		
	    case "Shift":
		// clear current character
		this.currentCharacter = null;
		this.needUpdateOnShiftKeyEvent = true;
		keyboardInputOccupy(this.getShiftKeyCode());
		if (keyinputDebugLog) console.log("shift key pressed");
		break;
	    default:
		if (keyinputDebugLog) console.log("unknown key");
		break;
	    }
	}else {
	    this.cursorPosInEvent = mainCursor.targetPos; 
	    this.needUpdateOnWASDEvent = true;
	}

    }

    
    displayStateUpdate(){
	
	if (!this.stateInitialized){
	    // paint grids by characters
	    systemGrid.paintGridsByList([heroes, enermies],
					[tile_type_enum.PASSING_CH,
					 tile_type_enum.NONPASSING_CH]);
	    this.displayCharacter = this.getEnermyHere([mainCursor.x, mainCursor.y]);
	    if (!this.displayCharacter)
		this.displayCharacter = this.getHeroHere([mainCursor.x, mainCursor.y]);
	    // clear all ui tiles
	    for (let h of heroes)
		h.ui_tiles = null;
	    for (let e of enermies)
		e.ui_tiles = null;
	    this.stateInitialized = true;
	}
		
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();

	// check if tutorial is on
	// if so close it on Enter key, or block every other updates 
	if (this.tutorialOnInDisplay){
	    this.tutorialUpdate(this.tutorialOnInDisplay);
	    return;
	}
	
	updateMainCursor();

	if (this.needUpdateOnWASDEvent){
	    this.fullInfoOn = false;
	    
	    this.displayCharacter = this.getEnermyHere(this.cursorPosInEvent);
	    if (!this.displayCharacter)
		this.displayCharacter = this.getHeroHere(this.cursorPosInEvent);
	    
	    if(battleStateDebugLog && this.displayCharacter)
		printVec2XYtoIJ("hover on char "+this.displayCharacter.name+" at",
				this.displayCharacter.x, this.displayCharacter.y,
				" DISPLAY");
	    
	    this.needUpdateOnWASDEvent = false;
	}else if (this.needUpdateOnEnterKeyEvent){
	    this.fullInfoOn  = false;
	    
	    let releaseKeyCode = this.getEnterKeyCode()
	    // get character at cursor locaton
	    let heroHere, enermyHere;
	    enermyHere = this.getEnermyHere(this.cursorPosInEvent);
	    // if found an enermy set to current character
	    // for ui tile calculation and display
	    // else try find a hero here
	    if(enermyHere){
		
		// paint anyway
		// TODO paint only when currentCharacter type changed
		systemGrid.paintGridsByList([heroes, enermies],
					    [tile_type_enum.NONPASSING_CH,
					     tile_type_enum.PASSING_CH]);
		this.currentCharacter = enermyHere;
		this.currentCharacterIsHero = false;
		this.currentCharacter.setUITiles(systemGrid);
		
		if(battleStateDebugLog)
		    printVec2XYtoIJ("select enermy char on ",
				    enermyHere.x, enermyHere.y,
				    " DISPLAY");
	    }else{
		heroHere = this.getHeroHere(this.cursorPosInEvent);
		
		// if found a hero then user has selected one
		
		if(heroHere){
		    playConfirmSound();
		    // paint anyway
		    systemGrid.paintGridsByList([heroes, enermies],
						[tile_type_enum.PASSING_CH,
						 tile_type_enum.NONPASSING_CH]);
		    
		    // if not active display like an enermy
		    this.currentCharacter = heroHere;
		    if (!heroHere.isActive){
			this.currentCharacter.setUITiles(systemGrid);
		    }else{

			// if is active
			// DISPLAY to MOVE 
			this.currentCharacterIsHero = true;
			this.enterNewState(this.list.MOVE);
			if(battleStateDebugLog)
			    printVec2XYtoIJ("select player char on ",
					    heroHere.x, heroHere.y,
					    "DISPLAY to MOVE");
		    }
		    // if found neither set to null
		}else this.currentCharacter = null;
	    }
		
	    keyboardInputRelease(releaseKeyCode);
	    this.needUpdateOnEnterKeyEvent = false;
	}else if(this.needUpdateOnShiftKeyEvent){
	    playCancelSound();
	    if (this.displayCharacter != null){
		this.fullInfoOn = !this.fullInfoOn;
	    }
	    keyboardInputRelease(this.getShiftKeyCode());
	    this.needUpdateOnShiftKeyEvent = false;
	}

    }

    
    displayStateDrawUI(){
	if (this.currentCharacter)
	    systemGrid.drawUITiles(buffer, this.currentCharacter.ui_tiles);
    }

    displayStateDrawTop(world_buffer, cursor, vport){
	if (this.tutorialOnInDisplay)
	    this.drawCenterMessage(world_buffer, vport, this.tutorialDisplayText);
	
	this.drawInfoToside(world_buffer, cursor, vport);
	if (this.fullInfoOn){
	    if (this.displayCharacter != null)
		this.displayCharacter.drawInfoFull(world_buffer, vport);
	}
    }
    

    moveStateInputEvent(key){
	
	let inputForCursor = false;
	if (!this.tutorialOnInMove)
	    inputForCursor = this.inputWASDEventsForCursor(key, "MOVE");
	
	if (!inputForCursor){
	    switch (key) {
	    case "Enter":
		this.cursorPosInEvent = [mainCursor.x, mainCursor.y]; 
		this.needUpdateOnEnterKeyEvent = true;
		keyboardInputOccupy(this.getEnterKeyCode());
		if (keyinputDebugLog) console.log("Enter key pressed in MOVE");
		break;
	    case "Shift":
		this.needUpdateOnShiftKeyEvent = true;
		keyboardInputOccupy(this.getShiftKeyCode());
		if (keyinputDebugLog) console.log("shift key pressed in MOVE");
		break;
	    default:
		if (keyinputDebugLog) console.log("unknown key");
		break;
	    }
	}
    }

    moveStateUpdate(){
	if (!this.stateInitialized){
	    this.errorOnNoCurrentHero();
	    // calculate ui tiles on init
	    this.currentCharacter.setUITiles(systemGrid);
	    // set prev pos to this position
	    this.preMoveCharacterIJ = this.currentCharacter.calculateIJ();
	    
	    this.stateInitialized = true;
	}

	
	
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();


	// check if tutorial is on
	// if so close it on Enter key, or block every other updates 
	if (this.tutorialOnInMove){
	    this.tutorialUpdate(this.tutorialOnInMove);
	    return;
	}
	
	updateMainCursor();

	if (this.currentCharacter.pathFinished){
	    // key board release on character finish path
	    keyboardInputRelease(this.currentCharacter.name+"CH_WALKING");
	    this.enterNewState(this.list.PRE_ACT);
	    if (battleStateDebugLog)
		console.log("MOVE to PRE_ACT by currentCharacter arrive destination");
	}



	if (this.needUpdateOnEnterKeyEvent){
	    
	    this.errorOnNoCurrentHero();
	    this.currentCharacter.setMoveTarget(this.cursorPosInEvent[0],
						this.cursorPosInEvent[1]);
	    let initSucceed = this.currentCharacter.initPathToMoveByTargetPos();
	    keyboardInputRelease(this.getEnterKeyCode());
	    if (initSucceed){ // lock input for path init in character
		keyboardInputOccupy(this.currentCharacter.name+"CH_WALKING");
		playConfirmSound();
	    }
	    this.needUpdateOnEnterKeyEvent = false;
	}

	else if (this.needUpdateOnShiftKeyEvent){
	    playCancelSound();
	    if(battleStateDebugLog)
		console.log("current player char on "+
			    "["+systemGrid.xToI(this.currentCharacter.x)+
			    " "+systemGrid.yToJ(this.currentCharacter.y) +"] "+
			    "MOVE back to DISPLAY")

	    // clean to move
	    this.currentCharacter.pathFinished = false;

	    // clear current character
	    // set back to display
	    this.currentCharacter = null;
	    
	    keyboardInputRelease(this.getShiftKeyCode());
	    
	    this.enterNewState(this.list.DISPLAY);
	    this.needUpdateOnShiftKeyEvent = false;
	}
    }


    moveStateDrawUI(){
	if (this.currentCharacter){
	    systemGrid.drawUITiles(buffer, this.currentCharacter.ui_tiles);
	    if (this.currentCharacter.path)
		systemGrid.drawPath(buffer, this.currentCharacter.path);
	}
    }

    moveStateDrawTop(world_buffer, mainCursor, vport){
	if (this.tutorialOnInMove)
	    this.drawCenterMessage(world_buffer, vport, this.tutorialMoveText);
    }


    preActStateInputEvents(key){
	let inputWS = false;

	if (!this.tutorialOnInPreAct){
	    // take selection by ws if there's a list
	    if (this.actionListStrs.length){
		inputWS = this.inputWSEventsForPreActList(key, "PRE_ACT");
		if (inputWS) return; 
	    }
	}

	if (!inputWS){
	    switch (key) {
	    case "Enter":
		this.needUpdateOnEnterKeyEvent = true;
		keyboardInputOccupy(this.getEnterKeyCode());
		if (keyinputDebugLog) printEventKey("Enter", "PRE_ACT");
		break;
	    case "Shift":
		this.needUpdateOnShiftKeyEvent = true;
		keyboardInputOccupy(this.getShiftKeyCode());
		if (keyinputDebugLog) printEventKey("shift", "PRE_ACT to MOVE");
		break;
	    default:
		if (keyinputDebugLog) console.log("unknown key");
		break;
	    }
	}
    }

    preActStateUpdate(){
	// init to error check only
	if (!this.stateInitialized){
	    // character's attack node tiles are set
	    // in their update when the path finishes
	    this.errorOnNoCurrentHero();
	    if( !this.currentCharacter.ui_tiles)
		console.error("No ui tiles at",
			      this.currentCharacter.i,
			      this.currentCharacter.j+"in PRE_ACT");

	    if( !this.actionListStrs.length)
		console.error("no action list str");
	    this.currentActionIndex = 0;
	    this.stateInitialized = true;
	}

	
	
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();

	// check if tutorial is on
	// if so close it on Enter key, or block every other updates 
	if (this.tutorialOnInPreAct){
	    this.tutorialUpdate(this.tutorialOnInPreAct);
	    return;
	}
	
	// on Enter key
	if (this.needUpdateOnEnterKeyEvent){
	    let releaseKeyCode = this.getEnterKeyCode();
	    if (this.currentActionIndex ==  this.actionList.ATK){
		playConfirmSound();
		if(battleStateDebugLog)
		    console.log("current player char on "+
				"["+systemGrid.xToI(this.currentCharacter.x)+
				" "+systemGrid.yToJ(this.currentCharacter.y) +"] "+
				" PRE_ACT to EXECUTE");
	    
		// enter EXECUTE
		this.enterNewState(this.list.EXECUTE);
	    }else if(this.currentActionIndex ==  this.actionList.WAIT){
		playConfirmSound();
		if(battleStateDebugLog)
		    console.log("current player char DONE on "+
				"["+systemGrid.xToI(this.currentCharacter.x)+
				" "+systemGrid.yToJ(this.currentCharacter.y) +"] "+
				" PRE_ACT to DISPLAY");
		// end this character
		// enter DISPLAY
		this.endThisCharacter(this.currentCharacter, tile_type_enum.PASSING_CH);
		this.currentCharacter.standInactive();
		// if all finshed to enermy turn
		if (this.allInactiveInList(heroes)){
		    //for (let h of heroes) h.isActive = true;
		    //for (let e of enermies) e.isActive = true;
		    //this.enermyTurnStateClear();
		    //this.enterNewState(this.list.ENERMY_TURN);
		    this.enterOppoTurnState(this.list.ENERMY_TURN);
		}else // otherwise back to display
		    this.enterNewState(this.list.DISPLAY);
	    }else console.error("unhandled pre act selection index", this.currentActionIndex);
	    keyboardInputRelease(releaseKeyCode);
	    this.needUpdateOnEnterKeyEvent = false;


	    // on Shift key
	}else if (this.needUpdateOnShiftKeyEvent){
	    playCancelSound();
	    if(battleStateDebugLog)
		console.log("current player char on "+
			    "["+systemGrid.xToI(this.currentCharacter.x)+
			    " "+systemGrid.yToJ(this.currentCharacter.y) +"] "+
			    "PRE_ACT back to MOVE");
	    
	    // set back to move
	    let character = this.currentCharacter;
	    // reset character pos to endNode in path
	    // to restore pre movement position
	    if(character.path != null){
		if (character.path.length){
		    character.setPos(character.path[character.path.length-1].i*systemGrid.size,
				     character.path[character.path.length-1].j*systemGrid.size);
		    // reset cursor to character position
		    // mainCursor.setPosition(character.x, character.y);
		}
	    }
	    // clean to move
	    character.pathFinished = false;
	    if (character.path!=null)
		character.path.splice(0, character.path.length);
	    character.standStill();
	    keyboardInputRelease(this.getShiftKeyCode());
	    this.enterNewState(this.list.MOVE);
	    
	    this.needUpdateOnShiftKeyEvent = false;
	}
	
    }

    
    preActStateDrawUI(){
	if (this.currentCharacter){
	    systemGrid.drawUITiles(buffer, this.currentCharacter.ui_tiles);
	    if (this.currentCharacter.path)
		systemGrid.drawPath(buffer, this.currentCharacter.path);
	
	}
    }

    preActStateDrawTop(world_buffer, cursor, vport){
	this.drawUIToSide(world_buffer, cursor, vport);
	if (this.tutorialOnInPreAct)
	    this.drawCenterMessage(world_buffer, vport, this.tutorialPreActText);
    }

    executeStateInputEvents(key){

	let inputWASD = false;
	if (!this.tutorialOnInExeute){
	    // take selection by wasd if there's a list
	    if (this.targetList.length){
		inputWASD = this.inputWASDEventsForTargetList(key, "EXECUTE");
		if (inputWASD){
		    let enermyIJ = this.targetList[this.currentTargetIndex].calculateIJ();
		    mainCursor.setPosition(enermyIJ[0] * systemGrid.size,
					   enermyIJ[1] * systemGrid.size);
		    this.needUpdateOnWASDEvent = true;
		    keyboardInputOccupy(this.getWASDKeyKeyCode());
		}
	    }
	}
	
	if (!inputWASD){
	    switch (key) {
	    case "Enter":
		if (keyinputDebugLog) printEventKey("Enter", "EXECUTE");
		this.needUpdateOnEnterKeyEvent = true;
		keyboardInputOccupy(this.getEnterKeyCode());
		break;
		
	    case "Shift":
		this.needUpdateOnShiftKeyEvent = true;
		keyboardInputOccupy(this.getShiftKeyCode());
		if (keyinputDebugLog) printEventKey("shift", "EXECUTE to MOVE");
		break;
	    default:
		if (keyinputDebugLog) console.log("unknown key");
		break;
	    }
	}

    }

    executeStateIfCounter(c0, c1){
	// decide if opponent can reach this character
	let dist = getMHTDist(systemGrid.xToI(c0.x),
			      systemGrid.yToJ(c0.y),
			      systemGrid.xToI(c1.x),
			      systemGrid.xToI(c1.y));
	for (let r of c1.atkRange){
	    if (r === dist){
		if (battleStateDebugLog)
		    console.log("battle range check counter",
				this.targetEnermyCounter,
				"between", c0.name, c1.name);
		return true;
	    }
	}
	if (battleStateDebugLog)
		    console.log("battle range check counter",
				this.targetEnermyCounter,
				"between", c0.name, c1.name);
	return false;
    }
    
    executeStateUpdate(){
	if (!this.stateInitialized){
	    // character's attack node tiles are set
	    // in their update when the path finishes
	    this.errorOnNoCurrentHero();
	    if( !this.currentCharacter.afterMoveActionTiles)
		console.error("No action tiles at",
			      this.currentCharacter.i,
			      this.currentCharacter.j+"in EXECUTE");

	    // clear array
	    this.targetList.splice(0, this.targetList.length);
		
	    // get all enermy within act tiles
	    for (let e of enermies){
		let enermyIJ = e.calculateIJ();
		let enermyNode = systemGrid.nodes[enermyIJ[0]][enermyIJ[1]]; 
		if (this.currentCharacter.afterMoveActionTiles.has(enermyNode))
		    this.targetList.push(e);
	    }

	    // if there is a list for all reachable targets
	    // set curosr here
	    if (this.targetList.length){
		this.currentTargetIndex = 0;
		this.targetEnermy = this.targetList[this.currentTargetIndex];
		let enermyIJ = this.targetEnermy.calculateIJ();
		mainCursor.setPosition(enermyIJ[0] * systemGrid.size,
				       enermyIJ[1] * systemGrid.size);

		this.targetEnermyCounter = this.executeStateIfCounter(this.currentCharacter, this.targetEnermy);
		if (battleStateDebugLog)
		    printVec2XYtoIJ(this.targetList.length+" target",
				    this.targetEnermy.x,
				    this.targetEnermy.y,"in EXECUTE");
	    }else{
		if (battleStateDebugLog)
		    printVec2XYtoIJ("no target for char at",
				    this.currentCharacter.x,
				    this.currentCharacter.y,"in EXECUTE");
	    }
	    this.stateInitialized = true;
	}
		
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();

	// check if tutorial is on
	// if so close it on Enter key, or block every other updates 
	if (this.tutorialOnInExeute){
	    this.tutorialUpdate(this.tutorialOnInExeute);
	    return;
	}

	if (this.needUpdateOnEnterKeyEvent){
	    
	    keyboardInputRelease(this.getEnterKeyCode());
	    if (this.targetList.length){
		playConfirmSound();
		this.targetEnermy = this.targetList[this.currentTargetIndex];
		// if press enter in pre act menu
		// an enermy must be selected
		// end turn for this character
		// enter ON_BATTLE with this enermy
		this.onBattleSetC0C1(this.currentCharacter, this.targetEnermy);
		this.onBattleSetPrevState(this.list.EXECUTE)
		this.endThisCharacter(this.currentCharacter, tile_type_enum.PASSING_CH);
		this.currentCharacter.standInactive(); // set to inactive
		this.enterNewState(this.list.ON_BATTLE);
	    }
	    
	    this.needUpdateOnEnterKeyEvent = false;

	}else if (this.needUpdateOnShiftKeyEvent){
	    playCancelSound();
	    if(battleStateDebugLog)
		console.log("current player char on "+
			    "["+systemGrid.xToI(this.currentCharacter.x)+
			    " "+systemGrid.yToJ(this.currentCharacter.y) +"] "+
			    "EXECUTE back to PRE_ACT")
	    
	    // set back to PRE_ACT
	    let character = this.currentCharacter;
	    // reset cursor to character position
	    mainCursor.setPosition(character.x, character.y);

	    keyboardInputRelease(this.getShiftKeyCode());
	    this.enterNewState(this.list.PRE_ACT);
	    
	    this.needUpdateOnShiftKeyEvent = false;
	}else if (this.needUpdateOnWASDEvent){
	    this.targetEnermy  = this.targetList[this.currentTargetIndex];

	    // decide if opponent can reach this character
	    this.targetEnermyCounter = this.executeStateIfCounter(this.currentCharacter, this.targetEnermy);

	    keyboardInputRelease(this.getWASDKeyKeyCode());
	    this.needUpdateOnWASDEvent = false;
	}

	
	//updateMainCursor();
    }

    
    executeStateDrawUI(){
	if (this.currentCharacter)
	    systemGrid.drawAfterMoveActionTiles(buffer, this.currentCharacter.afterMoveActionTiles);
    }

    executeStateDrawTop(world_buffer, cursor, vport){	
	this.drawPanelToSide(world_buffer, cursor, vport);
	if (this.tutorialOnInExeute)
	    this.drawCenterMessage(world_buffer, vport, this.tutorialExecuteText);
    
    }


    onBattleStateInputEvents(key){return};

    onBattleSetPrevState(s){this.onBattlePrevState = s;}
    onBattleSetC0C1(c0, c1){this.onBattleCharacters = [c0, c1];}
    onBattleInStart(){
	return this.onBattleFrameCount <= this.onBattleMyTurnCount;}
    onBattleInC0Turn(){
	return ((this.onBattleFrameCount <= this.onBattleOppoTurnCount) &&
		(this.onBattleFrameCount > this.onBattleMyTurnCount));
    }
    onBattleInC0TurnAttack(){
	let offset = (this.onBattleOppoTurnCount - this.onBattleMyTurnCount)/2;
	
	return ((this.onBattleFrameCount <= this.onBattleOppoTurnCount) &&
		(this.onBattleFrameCount > (this.onBattleMyTurnCount+offset)));
    }
    onBattleInC1Turn(){
	return ((this.onBattleFrameCount <= this.onBattleEndCount) &&
		(this.onBattleFrameCount > this.onBattleOppoTurnCount));
    }
    onBattleInC1TurnAttack(){
	let offset = (this.onBattleEndCount - this.onBattleOppoTurnCount)/2;
	return  ((this.onBattleFrameCount <= this.onBattleEndCount) &&
		(this.onBattleFrameCount > this.onBattleOppoTurnCount+offset));
    }
    
    onBattleInFinish(){
	return ((this.onBattleFrameCount <= this.onBattleQuitCount) &&
		(this.onBattleFrameCount > this.onBattleEndCount));
    }
    
    onBattleArriveC0Turn(){
	return this.onBattleFrameCount== this.onBattleMyTurnCount;}
    onBattleArriveC0Attack(){
	let offset = (this.onBattleOppoTurnCount - this.onBattleMyTurnCount)/2;
	return (this.onBattleFrameCount== (this.onBattleMyTurnCount + offset));
    }
    onBattleArriveC1Turn(){
	return this.onBattleFrameCount== this.onBattleOppoTurnCount;}
    onBattleArriveC1Attack(){
	let offset = (this.onBattleEndCount - this.onBattleOppoTurnCount)/2;
	return (this.onBattleFrameCount == (this.onBattleOppoTurnCount + offset));
    }
    onBattleArriveEnd(){
	return this.onBattleFrameCount== this.onBattleEndCount;}
    onBattleArriveQuit(){
	return this.onBattleFrameCount == this.onBattleQuitCount;}
   
    onBattleStateUpdate(){
	if (!this.stateInitialized){
	    this.onBattleFrameCount = 0;
	    this.onBattleHit = [this.onBattleCharacters[0].getIfHit(this.onBattleCharacters[1]),
				 this.onBattleCharacters[1].getIfHit(this.onBattleCharacters[0])]; // calculate hit rate
	    // damage if hit and opponent attacked
	    this.onBattleDamage = [this.onBattleCharacters[0].getDamageTo(this.onBattleCharacters[1]),
				   this.onBattleCharacters[1].getDamageTo(this.onBattleCharacters[0])]; // c1.Pow - c2.Pow;

	    // this is set before this state when target is decided
	    this.onBattleAttack = [true, this.targetEnermyCounter];
	    if (battleStateDebugLog) console.log(this.onBattleCharacters[0].name,
						 this.onBattleCharacters[1].name,
						 " battle counter?",
						 this.targetEnermyCounter);

	    
	    // have to decide if any side is dead
	    // to play death animation or to attack
	    for (let i=0; i<2; i++){
		let c_oppo = this.onBattleCharacters[(1-i)];
		// check if other side is dead
		if ((this.onBattleHit[i])&&(this.onBattleAttack[i]) &&
		    (c_oppo.Hp <= this.onBattleDamage[i])){
		    c_oppo.isAlive = false;
		    // if this attack cause opponent to die
		    // opponent doesn't attack
		    if (battleStateDebugLog)console.log(c_oppo.name,"no attack by death");
		    if (i==0) {this.onBattleAttack[1] = false; break;}
		    
		}
	    }
	    this.stateInitialized = true;
	    if (battleStateDebugLog) console.log("init ON_BATTLE");
	}

	if (this.onBattleArriveC0Attack()){
	    if (this.onBattleHit[0] && this.onBattleAttack[0]){
		this.onBattleCharacters[1].Hp -= this.onBattleDamage[0];
		this.onBattleCharacters[1].Hp = Math.max(this.onBattleCharacters[1].Hp, 0);
	    }
	}
	if (this.onBattleArriveC1Attack()){
	    if (this.onBattleHit[1] && this.onBattleAttack[1]){
		this.onBattleCharacters[0].Hp -= this.onBattleDamage[1];
		this.onBattleCharacters[0].Hp = Math.max(this.onBattleCharacters[0].Hp, 0);
	    }
	}

	// end of on battle animation
	if (this.onBattleArriveEnd()){
	    if (battleStateDebugLog) console.log("reach end ON_BATTLE");

	}


	if (this.onBattleArriveQuit()){

	    // check if each character is alive
	    // remove from list if !isAlive
	    for (let i =0; i<2 ; i++){
		let c = this.onBattleCharacters[i];
		if (!c.isAlive){
		    this.endThisCharacter(c, tile_type_enum.WALKABLE);
		    if (c.isHero){
			this.aliveHeroCount--;
			removeFromList(heroes, c);
			if (battleStateDebugLog)
			    printVec2XYtoIJ("hero at ",c.x,c.y," died");
		    }else{
			this.aliveEnermyCount--;
			removeFromList(enermies, c);
			if (battleStateDebugLog)
			    printVec2XYtoIJ("enermy at ",c.x,c.y," died");
		    }    
	
		}else{
		    // if alive after battle update Hp
		    // when opponent hit and attacked
		    //if (this.onBattleHit[1-i] && this.onBattleAttack[1-i])
		//	c.Hp -= this.onBattleDamage[1-i];
		}
	    }

	    // check if win or lose
	    if (battleStateDebugLog) console.log("reach quit ON_BATTLE");
	    if (this.aliveHeroCount && (!this.aliveEnermyCount)){
		console.log("win ON_BATTLE to FIN");
		this.enterNewState(this.list.FIN);
	    }else if ((!this.aliveHeroCount) && this.aliveEnermyCount){
		console.log("败");
		this.lose = true;
	    }else if (this.aliveHeroCount && this.aliveEnermyCount){
		if (battleStateDebugLog)
		    console.log ("battle finish for character at: ",
				 systemGrid.xToI(this.onBattleCharacters[0].x),
				 systemGrid.yToJ(this.onBattleCharacters[0].y),
				 "and enermy on",
				 systemGrid.xToI(this.onBattleCharacters[1].x),
				 systemGrid.yToJ(this.onBattleCharacters[1].y),
				 " ON_BATTLE to next state");
	    
		// go to next state
		if (this.onBattlePrevState == this.list.EXECUTE){
		    // if in EXECUTE state check if all heroes inactive
		    // if yes switch to ENERMY_TURN, if not continue to DISPLAY
		    if (this.allInactiveInList(heroes)){
			//for (let h of heroes) h.isActive = true;
			//for (let e of enermies) e.isActive = true;
			//this.enermyTurnStateClear();
			//this.enterNewState(this.list.ENERMY_TURN);
			this.enterOppoTurnState(this.list.ENERMY_TURN);
			if (battleStateDebugLog) console.log("player to enermy turn");
		    }else this.enterNewState(this.list.DISPLAY);
		    
		}else if (this.onBattlePrevState == this.list.ENERMY_TURN){
		    // if in enermy state check if all enermies inactive
		    // if yes switch to DISPLAY, if not back to ENERMY_TRUN
		    if (this.allInactiveInList(enermies)){
			//for (let h of heroes) h.isActive = true;
			//for (let e of enermies) e.isActive = true;
			//this.enterNewState(this.list.DISPLAY);
			this.enterOppoTurnState(this.list.DISPLAY);
			if (battleStateDebugLog) console.log("enermy to player turn");
		    }else this.enterNewState(this.list.ENERMY_TURN);
		}else console.error("From unhandled state ",this.onBattlePrevState);
	    }
	}
	this.onBattleFrameCount++;
    }

    onBattleStateDrawTop(){
	if (this.lose){
	    buffer.fillStyle = "darkgray";
	    buffer.fillRect(viewport.startTilePos[0], viewport.startTilePos[1],
			    viewport.w, viewport.h);

	    buffer.font = '30px Arial';
	    let textStr = "Lose";
	    buffer.fillStyle = 'white';
	    buffer.fillText(textStr,
			    viewport.startTilePos[0] + viewport.w/2 - buffer.measureText(textStr).width/2,
			    viewport.startTilePos[1] + viewport.h/2)


	    return;
	}

	this.drawBattleScene(buffer,mainCursor, viewport);
	if (this.onBattleInStart()){
	    //this.drawDialog(buffer, mainCursor, viewport, this.onBattleCharacters[0].name+ "and "+this.onBattleCharacters[1].name);

	}else if (this.onBattleInC0TurnAttack()){
	    //this.drawDialog(buffer, mainCursor, viewport, this.onBattleCharacters[0].name+((this.onBattleHit[0]&&this.onBattleAttack[0])?" hit ":" missed "+this.onBattleCharacters[1].name) +", hp "+this.onBattleCharacters[1].Hp+"->"+(this.onBattleHit[0]?(this.onBattleCharacters[1].Hp-this.onBattleDamage[0]):this.onBattleCharacters[1].Hp ));
	    if ((this.onBattleAttack[0])&&(!this.onBattleHit[0]))
		this.drawCenterMessage(buffer, viewport, ["miss"], 30);
	}else if (this.onBattleInC1TurnAttack()){
	    /*this.drawDialog(buffer, mainCursor, viewport,
			    this.onBattleCharacters[1].name+
			    (this.onBattleHit[1]?" hit ":" missed "+this.onBattleCharacters[0].name)
			    +", hp "+this.onBattleCharacters[0].Hp
			    +"->"+
			    ((this.onBattleHit[1]&&this.onBattleAttack[1])?(this.onBattleCharacters[0].Hp-this.onBattleDamage[1]):this.onBattleCharacters[0].Hp ));*/
	    if ((this.onBattleAttack[1])&&(!this.onBattleHit[1]))
		this.drawCenterMessage(buffer, viewport, ["miss"], 30);
	}else if (this.onBattleInFinish()){
	    // death animation
	    if (!this.onBattleCharacters[0].isAlive)
		this.onBattleCharacters[0].h*= 0.9;
	    if (!this.onBattleCharacters[1].isAlive)
		this.onBattleCharacters[1].h *= 0.9;
	}// else on draw. reach quit	

    }
    

    // no need
    // enermyTurnStateInputEvents(key){return}

    enermyTurnStateClear(){
	this.targetEnermy = null;
	this.enermyTurnCurrent = null;
    }
    
    enermyTurnSetMove(e){
	// find target in range
	this.targetEnermy = null;
	for (let h of heroes){
	    let heroIJ = h.calculateIJ();
	    let heroNode = systemGrid.nodes[heroIJ[0]][heroIJ[1]]; 
	    if (e.ui_tiles[1].has(heroNode)){
		if (!this.targetEnermy) this.targetEnermy = h;
		else if(this.targetEnermy.Hp > h.Hp) this.targetEnermy = h;
	    }
	}

	// Defense AI
	// if found move and attack, else can't set move for e 
	if (this.targetEnermy){
	    if (battleStateDebugLog) printVec2XYtoIJ("Enermy "+e.name+" found weakest hero "+this.targetEnermy.name+
						     " at",
						     this.targetEnermy.x,
						     this.targetEnermy.y);
	    
	    let currentIJ = this.targetEnermy.calculateIJ();
	    let targetNeighbors = [];
	    
	    if (currentIJ[0] !=0)
		targetNeighbors.push(systemGrid.nodes[currentIJ[0]-1][currentIJ[1]  ]);
	    if (currentIJ[0] != (systemGrid.dim-1))
		targetNeighbors.push(systemGrid.nodes[currentIJ[0]+1][currentIJ[1]  ]);
	    if (currentIJ[1] !=0)
		targetNeighbors.push(systemGrid.nodes[currentIJ[0]  ][currentIJ[1]-1]);
	    if (currentIJ[1] != (systemGrid.dim-1))
		targetNeighbors.push(systemGrid.nodes[currentIJ[0]  ][currentIJ[1]+1]);	

	    if(battleStateDebugLog) console.log("Enermy has",targetNeighbors.length,"neighbors to go");
	    
	    // set path to move 
	    for (let n of targetNeighbors){

		// check if at original position
		let eIJ = e.calculateIJ();
		if ((eIJ[0] == n.i) && (eIJ[1] == n.j)){
		    if (battleStateDebugLog) console.log(e.name," atk at its original grid", e.i, e.j);
		    e.pathFinished = true;
		    return true;
		}

		// if need to move, consider only WALKABLE tiles
		if (n.type != tile_type_enum.WALKABLE) continue;
		if (battleStateDebugLog)
		    console.log(eIJ[0], eIJ[1]," considering neighbor", n.i, n.j);
		
		if (e.ui_tiles[0].has(n)){
		    e.setMoveTarget(n.i*systemGrid.size, n.j*systemGrid.size);
		    let succeed =  e.initPathToMoveByTargetPos();
		    if (!succeed){
			if (battleStateDebugLog) console.log("No path to a node in move ui tiles, type", n.type);
		    }else {
			if (battleStateDebugLog) console.log("Enermy", e.name, "intend move to", n.i, n.j,
							     "to attack", currentIJ[0], currentIJ[1]);
			return true;
		    }
		}else{ if (battleStateDebugLog) console.log("neighbor",n.i, n.j, n.type, "not in move tiles");}
	    }
	    
	    if (battleStateDebugLog) console.log(e.path);
	    if(!e.path){ console.error("No path found for a target in attack range"); return false;}
	    else return true;

	}else return false;
    }
    
    enermyTurnStateDrawUI(){
	if (!this.enermyTurnCurrent )return;
	
	if (this.enermyTurnCurrent.ui_tiles)
	    systemGrid.drawUITiles(buffer, this.enermyTurnCurrent.ui_tiles);
    }
    
    enermyTurnStateUpdate(){
	if (!this.stateInitialized){
	    this.enermyTurnDisplayFCount = 0;
	    this.enermyTurnToAtk = false;
	    this.enermyTurnCurrent = this.getNextActiveInList(enermies);
	    let e = this.enermyTurnCurrent;
	    
	    // check if current enermy list is done
	    if (e == null){
		if (battleStateDebugLog){
		    if (!this.allInactiveInList(enermies))
			console.error("No all enermies inactive!");
		}
		this.enterOppoTurnState(this.list.DISPLAY);
	    }else{
		
		// paint character grids
		systemGrid.paintGridsByList([enermies, heroes],
					    [tile_type_enum.PASSING_CH,
					     tile_type_enum.NONPASSING_CH]);
		
		// set prev pos to this position
		// calculate ui tiles
		mainCursor.setPosition(e.x, e.y);

		e.setUITiles(systemGrid);
		
		if (battleStateDebugLog)
		   printVec2XYtoIJ("Start enermy "+this.enermyTurnCurrent.name+
				   " at", e.x, e.y);
		this.enermyTurnToAtk = this.enermyTurnSetMove(e);
		this.preMoveCharacterIJ = e.calculateIJ();
		    
		this.stateInitialized = true;
	    }
	}
	    
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();

	if (this.enermyTurnDisplayFCount >= 60){
	    let e = this.enermyTurnCurrent;
	    if (this.enermyTurnToAtk){
		mainCursor.setPosition(e.x, e.y);
		// on arrive attack grid
		if (e.pathFinished){
		    // set to battle
		    if (battleStateDebugLog) console.log("to battle",
							 e.name,
							 this.targetEnermy);
		    this.onBattleSetC0C1(e, this.targetEnermy);
		    this.onBattleSetPrevState(this.list.ENERMY_TURN)
		    this.endThisCharacter(e, tile_type_enum.PASSING_CH);
		    e.standInactive();
		    
		    this.targetEnermyCounter = this.executeStateIfCounter(e,
									  this.targetEnermy);
		
		    this.enterNewState(this.list.ON_BATTLE);
		    this.enermyTurnToAtk = false;
		}
	    }else{
		// this e not doing anything
		// move to next in list
		if (battleStateDebugLog)
		    printVec2XYtoIJ("No atk enermy "+this.enermyTurnCurrent.name+
				    " at", e.x, e.y);
		
		this.endThisCharacter(e, tile_type_enum.PASSING_CH);
		// let next init handle next enermy in list
		this.enterNewState(this.list.ENERMY_TURN);
	    }
	}

	this.enermyTurnDisplayFCount++;
    }


    introStateInputEvent(key){
	// set no lock for this
	if (key == "Enter") this.needUpdateOnEnterKeyEvent = true;
    }

    introStateDrawTop(){
	if (this.instr != null){
	    if (this.instr.isDialog)
		this.drawDialog(buffer, mainCursor, viewport, this.instr.line,
				this.currentCharacter);
	}
	buffer.drawImage(map, 8*systemGrid.size, 3*systemGrid.size,
			 systemGrid.size, systemGrid.size,
			 10*systemGrid.size, 9*systemGrid.size,
			 systemGrid.size, systemGrid.size,)
    }

    introStateHandleCurrentInstr(){
	if (this.instr.isDialog){
	    this.currentCharacter = getCharacterByName(heroes, this.instr.speaker);
	}else{ // movement instruction
	    for (let m of this.instr.moveList){
		
		let moveCharacter = getCharacterByName(heroes, m[0]);
		if (moveCharacter == null)
		    moveCharacter = getCharacterByName(enermies, m[0]);

		if (moveCharacter == null) console.error("intro move character",
							 moveCharacter, m[0],
							 " not exist");
		let currentIJ = moveCharacter.calculateIJ();
		let targetPosIJ = [m[1], m[2]];
		moveCharacter.path = systemGrid.findPath(currentIJ[0], currentIJ[1],
							 targetPosIJ[0], targetPosIJ[1]);
		if (!moveCharacter.path) console.error("INTRO move path failed!",
						       this.instr.line);
		moveCharacter.pathFinished = false;
		moveCharacter.path_index = moveCharacter.path.length - 2;
		moveCharacter.moveToNextTileInPath();
	    }
	    this.currentCharacter = null;
	}
    }

    introStateAllMoveDone(){
	for (let m of this.instr.moveList){
	    let c = getCharacterByName(heroes, m[0]);
	    if (c == null) c = getCharacterByName(enermies, m[0]);
	    if (!c.pathFinished){
		return false
	    }else c.standStill();
	}
	return true;
    }

    introStateUpdate(){
	if (!this.stateInitialized){
	    mainCursor.setPosition(heroes[0].x, heroes[0].y);
	    if (this.instr == null) console.error("no instruction for intro!");
	    this.instr.setToNextLine();
	    this.introStateHandleCurrentInstr();
	    this.stateInitialized = true;
	}

	if (this.needUpdateOnEnterKeyEvent){
	    if (this.instr.isDialog){
		this.instr.setToNextLine();
		this.introStateHandleCurrentInstr();
	    }
	    this.needUpdateOnEnterKeyEvent = false;
	}

	
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();

	// if movement going, check for finish
	if (!this.instr.isDialog){
	    if (this.introStateAllMoveDone()){
		if (battleStateDebugLog) console.log("All movement finish this line");
		this.instr.setToNextLine();
		this.introStateHandleCurrentInstr()
	
	    };
	}


	if (this.instr.finished){
	    this.currentCharacter = null;
	    for (let c of heroes){
		c.pathFinished = false;
		if (c.path!=null)
		    c.path.splice(0, c.path.length);
		c.path_index = -1;
		c.hasMoved = false;
		c.isActive = true;
	    }
	    for (let c of enermies){
		c.pathFinished = false;
		if (c.path!=null)
		    c.path.splice(0, c.path.length);
		c.path_index = -1;
		c.hasMoved = false;
		c.isActive = true;
	    }
	    this.enterNewState(this.list.DISPLAY);
	}
    }


    
    finStateInputEvent(key){
	// set no lock for this
	if (key == "Enter") this.needUpdateOnEnterKeyEvent = true;
    }

    finStateDrawTop(){
	if (this.win){
	    buffer.fillStyle = "darkgray";
	    buffer.fillRect(viewport.startTilePos[0], viewport.startTilePos[1],
			    viewport.w, viewport.h);

	    buffer.font = '30px Arial';
	    let textStr = "胜";
	    buffer.fillStyle = 'white';
	    buffer.fillText(textStr,
			    viewport.startTilePos[0] + viewport.w/2 - buffer.measureText(textStr).width/2,
			    viewport.startTilePos[1] + viewport.h/2)

	}
	if (this.instr != null){
	    if (this.instr.isDialog)
		this.drawDialog(buffer, mainCursor, viewport, this.instr.line,
				this.currentCharacter);
	}

    }

    finStateHandleCurrentInstr(){
	if (this.instr.isDialog){
	    this.currentCharacter = getCharacterByName(heroes, this.instr.speaker);
	}else{ // movement instruction
	    for (let m of this.instr.moveList){
		
		let moveCharacter = getCharacterByName(heroes, m[0]);
		if (moveCharacter == null)
		    moveCharacter = getCharacterByName(enermies, m[0]);

		if (moveCharacter == null) console.error("fin move character",
							 moveCharacter,
							 " not exist");
		let currentIJ = moveCharacter.calculateIJ();
		let targetPosIJ = [m[1], m[2]];
		moveCharacter.path = systemGrid.findPath(currentIJ[0], currentIJ[1],
							 targetPosIJ[0], targetPosIJ[1]);
		if (!moveCharacter.path) console.error("FIN move path failed!",
						       this.instr.line);
		moveCharacter.pathFinished = false;
		moveCharacter.path_index = moveCharacter.path.length - 2;
		moveCharacter.moveToNextTileInPath();
	    }
	    this.currentCharacter = null;
	}
    }

    finStateAllMoveDone(){
	for (let m of this.instr.moveList){
	    let c = getCharacterByName(heroes, m[0]);
	    if (c == null) c = getCharacterByName(enermies, m[0]);
	    if (!c.pathFinished){
		return false
	    }else{ // face front
		c.standStill();
	    }
	}
	return true;
    }

    finStateUpdate(){
	if (!this.stateInitialized){
	    // reset hero lists
	    heroes.splice(0, heroes.length);
	    for (let i=0; i< 4; i++){
		let h = new Character();
		h.spriteSheetImage = hero_walking_sprite;
		h.battleSheetImage = hero_battle_sprite;
		h.animation.change(frame_sets[4], ANIMATION_DELAY);
		h.setPosByGridIJ(6-i, 4, systemGrid);
		h.setSize(SPRITE_SIZE, SPRITE_SIZE);
		h.built_in_i = i;
		h.setByBuiltInI(true);
		h.portrait = portrait;
		heroes.push(h);	
	    }
	    mainCursor.setPosition(heroes[0].x, heroes[0].y);
	    
	    loadFin();
	    if (this.instr == null) console.error("no instruction for fin!");
	    this.instr.setToNextLine();
	    this.finStateHandleCurrentInstr();
	    this.stateInitialized = true;
	}

	if (this.needUpdateOnEnterKeyEvent){
	    if (this.instr.isDialog){
		this.instr.setToNextLine();
		this.finStateHandleCurrentInstr();
	    }
	    this.needUpdateOnEnterKeyEvent = false;
	}

	
	//update scene
	for (let h of heroes)
	    h.update();
	for (let e of enermies)
	    e.update();

	// if movement going, check for finish
	if (!this.instr.isDialog){
	    if (this.finStateAllMoveDone()){
		if (battleStateDebugLog) console.log("All movement finish this line");
		this.instr.setToNextLine();
		this.finStateHandleCurrentInstr()
	
	    };
	}


	if (this.instr.finished){
	    this.currentCharacter = null;
	    for (let c of heroes){
		c.pathFinished = false;
		c.path.splice(0, c.path.length);
		c.path_index = -1;
		c.hasMoved = false;
		c.isActive = true;
	    }
	    for (let c of enermies){
		c.pathFinished = false;
		c.path.splice(0, c.path.length);
		c.path_index = -1;
		c.hasMoved = false;
		c.isActive = true;
	    }
	    //this.enterNewState(this.list.DISPLAY);
	    if (this.win == false){
		this.win = true;
		loadFin2();
	    }
	}
    }

    
    drawUITiles(){
	if (this.isDisplay())
	    this.displayStateDrawUI();
	else if (this.isMove())
	    this.moveStateDrawUI();
	else if (this.isPreAct())
	    this.preActStateDrawUI();
	else if (this.isExecute())
	    this.executeStateDrawUI();
	else if (this.isEnermyTurn())
	    this.enermyTurnStateDrawUI();
	else
	    return false;
	return true;
    }

    drawTopLayer(){
	if (this.isDisplay())
	    this.displayStateDrawTop(buffer, mainCursor, viewport);
	else if (this.isMove())
	    this.moveStateDrawTop(buffer, mainCursor, viewport);
	else if (this.isPreAct())
	    this.preActStateDrawTop(buffer, mainCursor, viewport);
	else if (this.isExecute())
	    this.executeStateDrawTop(buffer, mainCursor, viewport);
	else if (this.isOnBattle())
	    this.onBattleStateDrawTop(buffer, mainCursor, viewport);
	else if (this.isIntro())
	    this.introStateDrawTop();
	else if (this.isFin())
	    this.finStateDrawTop();
    }
    
    

    update(){
	if (this.isDisplay())
	    this.displayStateUpdate();
	else if (this.isMove())
	    this.moveStateUpdate();
	else if (this.isPreAct())
	    this.preActStateUpdate();
	else if (this.isExecute())
	    this.executeStateUpdate();
	else if (this.isOnBattle())
	    this.onBattleStateUpdate();
	else if (this.isEnermyTurn())
	    this.enermyTurnStateUpdate();
	else if (this.isIntro())
	    this.introStateUpdate();
	else if (this.isFin())
	    this.finStateUpdate();
	else{

	    for (let c of heroes)
		c.update();
	    for (let c of enermies)
		c.update();
	    
	    updateMainCursor();

	    // recalculate path if requested by user input
	    if (tilePaintingType == -2){

		//path = systemGrid.findPath(0,0,targetCalculatePathPos[0], targetCalculatePathPos[1]);
		//heroes[0].ui_tiles = systemGrid.getUITiles( Math.floor(heroes[0].x / systemGrid.size),
		//					    Math.floor(heroes[0].y / systemGrid.size), 
		//					    2,[2]);
		//console.log(heroes[0].ui_tiles);
		tilePaintingType = -1;
	    }

	    //console.log( this.currentState+" state not handled, default updates");
	    return false;

	}
	return true;

    }

    inputEvents(key){
	if(this.currentState == this.list.DISPLAY)
	    this.displayStateInputEvents(key);
	else if (this.isMove())
	    this.moveStateInputEvent(key);
	else if (this.isPreAct())
	    this.preActStateInputEvents(key);
	else if (this.isExecute())
	    this.executeStateInputEvents(key);
	else if (this.isOnBattle())
	    this.onBattleStateInputEvents(key);
	else if (this.isEnermyTurn()){}
	else if (this.isIntro())
	    this.introStateInputEvent(key);
	else if (this.isFin())
	    this.finStateInputEvent(key);
	else return false;
	return true;

    }




}
