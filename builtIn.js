// built in look up indices for player info


function playerInfo(name){
    			// hp, str, skill, luck,  def, res, mov ,atkrg0, atkrang1 ..
    if (name == "hero0") return [15, 5, 3, 2,  3, 1, 4, 1];
    if (name == "hero1") return [15, 4, 5, 3,  2, 2, 5, 1];
    if (name == "hero2") return [12, 4, 3, 2,  1, 4, 3, 1,2];
    if (name == "hero3") return [10, 0, 7, 5,  2, 3, 4, 1];

    console.error("unkown hero name", name);
    return [];
}



class Instruction{
    constructor(s){
	this.strs = s.split("\n");// s.split("/\r?\n/");
	this.lineIndex = 0;
	this.speaker = null;
	this.finished = false;

	this.isDialog = false; // dialog or movement
	this.line = null;
	this.moveList = []; // [[name0, i, j], [name1, i, j] ...]
    }

    loadStr(s){
	this.strs = s.split("\n");// s.split("/\r?\n/");
	this.lineIndex = 0;
	this.speaker = null;
	this.finished = false;

	this.isDialog = false; // dialog or movement
	this.line = null;
	this.moveList = []; // [[name0, i, j], [name1, i, j] ...]
    }

    setTodoOnCurrentLine(){
	let words = this.line.split(" && ");
	if (words.length > 1){
	    this.moveList.splice(0, this.moveList.length);
	    for (let w of words){
		if (w=="") continue;
		let strings = w.split(" ");
		this.moveList.push(strings);
	    }
	    this.isDialog = false;
	   
	}else this.isDialog = true;
    }

    setToNextLine(){
	while (this.strs.length != this.lineIndex){
	    let lineRaw = this.strs[this.lineIndex];
	    console.log("on line:", lineRaw);
	    if (!lineRaw.replace(/\s/g, "").length){
		this.lineIndex++;
		continue;
	    }
	    let nameAndString = lineRaw.split("# ");
	    if (nameAndString.length == 2){
		this.speaker = nameAndString[0];
		this.line = nameAndString[1];
		this.isDialog = true;
	    }else{
		this.line =  nameAndString[0];
		this.setTodoOnCurrentLine();
	    }
	    this.lineIndex++;
	    return true;
	}
	this.finished = true;
	return false;
    }
}

function loadTutorial(){

    battleState.tutorialSetTo(true);

    battleState.actionPanelTexts = ["Hp", "威力", "命中"];
    battleState.actionListStrs = ["攻击", "待机"];
    
    battleState.currentState = battleState.list.INTRO;
    
    battleState.tutorialDisplayText = [	"游戏说明 ",
				       					"敌我双方轮流行动，对方全灭获胜",
				       					"操作： WASD 移动光标",
				       					"Enter 确认  Shift 返回",
				       					"选择己方角色按下确认键进行移动",
				       					"选择任何角色按下返回键查看详细",
				       					"按下确认键关闭此窗口"];
    battleState.tutorialMoveText = [ 	"移动说明",
				    				 	"确认角色选择后，选择移动目的地",
				    				 	"蓝色格子为可移动范围",
				    				 	"红色格子为移动后攻击范围",
				    				 	"Enter 确认移动 Shift 返回上一步",
				       				 	"按下确认键关闭此窗口"];
    battleState.tutorialPreActText = [	"行动说明",
    									"WS 进行菜单选择",
				      					"Enter 确认选项 Shift 返回上一步",
				      					"选择攻击后，进入目标选择",
				      					"选择待机后，此角色结束回合",
				      					"全部己方角色行动结束敌方回合开",
				      					"始，依此轮替",
				       					"按下确认键关闭此窗口"];
	battleState.tutorialExecuteText = [	"以WASD选择攻击范围内目标",
				      					"Enter 确认选项 Shift 返回上一步",
				      					"窗口显示此次攻击与反击信息",
				      					"攻击后此角色此回合行动结束",
				      					"按下确认键关闭此窗口"];
    
}

function loadIntro(){
    var introInstr = new Instruction("hero0# 诶……\n"+
    				"hero0# 好！\n"+
    				 "hero1# 好样的，我的也弄开了！\n"+
				     "hero0 4 11 && hero1 4 10 \n"+
				     "hero0# 我这辈子不想呆在这了，\n"+
				     "hero0# 山里的牢房，做梦都像是在闹鬼\n"+
				     "hero1# 我倒觉得刺配还算不错\n"+
				     "hero1# 当时员外家的少爷可是要我们死\n"+
				     "hero0# 我知道你能耐大，我欠你一条命\n"+
				     "hero0# 但你我之间也不差这一条了，总之快走吧\n"+
				     "hero0# 拿着，偷钥匙时候从被打昏的守卫那里摸的\n"+
				     "hero0# 出去说不定会碰到人\n"+
				     "hero1# 好\n"+
				     "hero0 5 11 && hero1 5 10 \n"+
				     "hero1# 等等，我们得带上刘子\n"+
				     "hero0# 那边那个？你对她知根底吗？\n"+
				     "hero1# 嗯，江湖上之前熟识的朋友\n"+
				     "hero1# 我信得过她\n"+
				     "hero0# 好，出去路上也多个人手\n"+
				     "hero0 11 10 && hero1 10 10\n"+
				     "hero2# 陈倩楠……？你们还真给逃出来了\n"+
				     "hero1# 手上还有钥匙呢，等着\n"+

				     "xxx# 你怎么守门睡着了……等等，喂！!\n"+
				     "xxx# 有人被打昏了！\n"+
				     "enermy3 12 3 && \n"+
				     "xxx# 来人！\n"+
				     "enermy2 7 4 && enermy1 8 6 && enermy0 10 5\n"+

				     "hero0# 啧、这么快被发现了\n"+
				     "hero0# 没办法了\n"+
				     "hero1# 闯出一条路来！\n"+

				     "hero2# 我来助你们一臂之力\n"+
				     "hero0# 啧……但是我们手上没有多的兵器了\n"+
				     "hero1# 没事，你看她身上还带着那把木剑呢\n"+
				     "hero0# 木剑？这能砍吗\n"+
				     "hero1# 此人江湖诨号山道士刘姝贤\n"+
				     "hero1# 看着好了，那把剑可不是用来砍的"
				     );

    battleState.instr = introInstr;
}

function loadFin(){
    var finInstrStr = ("hero0# 呼……没完没了的\n"+
    			"hero0# 这里的朋友们，还有想一起走的没有？\n"+
    			"xxx# (囚犯)……太冒险了\n"+
    			"xxx# (囚犯)出去了活罪变死罪。\n"+
    			"xxx# (囚犯)况且那么多人把守，多能打也出不去的\n"+
		       "hero3# 背面有一个卫兵的休息室通向外面\n"+
		       "hero3# 这个时候应当反而空下来了，不引人注意\n"+
		       "hero0 2 4 && hero1 3 4 && hero2 3 5\n"+
		       "hero0# 你认得路？\n"+
		       "hero3# 帮忙烧过饭，知道一点\n"+
		       "hero0# 太好了，介意我们拽上你一道逃吗\n"+
		       "hero3# 请务必，这里快闷死我了\n"+
		       "hero0# 哈！"
		       );
    
    battleState.instr.loadStr(finInstrStr);
}

function loadFin2(){
    var finInstrStr = (
"hero0# 接下来我们去哪里，各自回去吗？\n"+
"hero0# 我听说书信里的状况不是很好\n"+
"hero1# 不错，况且我们现在回去只能连累其他人\n"+
"hero1# 不说之前得罪的泼皮少爷，如牢里那人所说\n"+
"hero1# 现在我们出逃加罪，八成成了死刑犯\n"+
"hero1# 被抓到其他人窝藏我们，怕是给人大添麻烦\n"+
"hero1# ……你们二人是什么打算\n"+
"hero2# 我本来就在山野行走，去哪倒不打紧\n"+
"hero2# 只是陈倩楠你说得对，暂时是不要回去的好\n"+
"hero1# 作风还是老样子。说来你原本犯什么罪？\n"+
"hero2# 拿药救了一个官老爷要害的人\n"+
"hero2# 最后那人还是死了，栽赃说我下的毒\n"+
"hero2# 衙门里打官司，最后这样了\n"+
"hero0# 啐！又是钱没送到位\n"+
"hero1# 怕不是对面钱送的太到位\n"+
"hero1# ……不论如何，真是荒唐，\n"+
"hero1# 救人的反倒被判杀人的罪\n"+
"hero1# 啊，害，忘了介绍，二位、这是我结拜大姐\n"+
"hero0# 红毛狮张笑盈\n"+
"hero1# 在下通天手陈倩楠\n"+
"hero2# 山道士刘姝贤\n"+
"hero3# 红袍秀士张怀瑾\n"+
"hero0# 哦——所以你是真的杀了人的那个\n"+
"hero3# ……也没有，那一刀出去我力气不大。可惜\n"+
"hero1# 此话怎讲。我只听人说你刺伤官吏\n"+
"hero3# 我本身未取功名，住一间偏僻破屋里\n"+
"hero3# 一日家中为贼人所占，告上去结果官府不管\n"+
"hero1# 没油水又和贼人搏命，怕是没人愿意干苦差\n"+
"hero3# 不错，他们看我闹，反要联合贼人赶我出去\n"+
"hero3# 我在这无亲无财，没这地方怎么生活呢？\n"+
"hero3# 被逼绝路，就端起厨房菜刀\n"+
"hero3# 但话说回来，这附近我倒真知道一个去处\n"+
"hero3# 这山头上有一伙绿林，占山为王，自给自足\n"+
"hero3# 官兵也不敢管他们\n"+
"hero2# 落草为寇\n"+
"hero0# 当官的不仁，贼又有什么做不起的\n"+
"hero1# 不错。这伙人闻名四方，很有一些规模\n"+
"hero1# 想来我们刺配这里，说不准也是缘分\n"+
"hero0# 好！那我们快些赶路！\n"+
"xxx# 完。"
		       );
    
    battleState.instr.loadStr(finInstrStr);
}

function loadHeroes(){
    for (let i=0; i< 3; i++){
	let h = new Character();
	h.spriteSheetImage = hero_walking_sprite;
	h.battleSheetImage = hero_battle_sprite;
	h.animation.change(frame_sets[4], ANIMATION_DELAY);
	h.setPosByGridIJ(6-i, 4, systemGrid);
	h.setSize(SPRITE_SIZE, SPRITE_SIZE);
	h.built_in_i = i;
	h.setByBuiltInI(true);
	//h.Hp = 5;
	h.portrait = portrait;
	heroes.push(h);	
    }
    heroes[0].setPosByGridIJ(4,10, systemGrid);
    heroes[1].setPosByGridIJ(2,10, systemGrid);
    heroes[2].setPosByGridIJ(11,7, systemGrid);
}


function loadEnermies(){
    for (let i=0; i< 4; i++){
	let e = new Character();
	e.spriteSheetImage = enermy_walking_sprite;
	e.battleSheetImage = enermy_battle_sprite;
	e.animation.change(frame_sets[4], ANIMATION_DELAY);
	e.setPosByGridIJ(12, 0, systemGrid);
	e.setSize(SPRITE_SIZE, SPRITE_SIZE);
	e.name = "enermy"+i;
	//e.Hp = 2;
	e.built_in_i = Math.floor(i/3);
	e.isHero = false;
	enermies.push(e);
    }
    enermies[3].fullHp = 15;
    enermies[3].Hp = enermies[3].fullHp;
    enermies[3].Def = 2;
}

function loadGridTypes(){
    let types = [
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,  
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 
	1, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1,  
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
	1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,  
	1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1,  
	1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 
	1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1,  
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
	1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ];
    
    for (let j=0; j<systemGrid.dim[1];j++){
	for (let i=0; i<systemGrid.dim[0];i++){
	    if (types[j*systemGrid.dim[0]+i] == 1)
		systemGrid.setGridType(i,j, tile_type_enum.BLOCKING);
	    else systemGrid.setGridType(i,j,tile_type_enum.WALKABLE);
	}
    }
    // populate neighbor nodes list
    systemGrid.calculateNeighborNodes();


}

function getDisplayName(n){
    if (n == "hero0") return "张笑盈";
    if (n == "hero1") return "陈倩楠";
    if (n == "hero2") return "刘姝贤";
    if (n == "hero3") return "张怀瑾";
    
    let texts = n.split("enermy");
    if (texts.length == 2){
	if (texts[0]==""){
	    if(texts[1]=="0") return "狱卒";
	    if(texts[1]=="1") return "狱卒";
	    if(texts[1]=="2") return "狱卒";
	    if(texts[1]=="3") return "狱卒长";
	    
	}
    }

    return n;
}


function playConfirmSound(){
    var sound = new Howl({
	src: ['howler/confirm.wav'],
	volume: 0.1
    });

    sound.play();
}

function playCancelSound(){
    var sound = new Howl({
	src: ['howler/cancel.wav'],
	volume: 0.01
    });

    sound.play();
}

function playWalkSound(){
    var sound = new Howl({
	src: ['howler/walk.wav'],
	volume: 0.5
    });

    sound.play();
}
