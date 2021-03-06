class SpecialEvent{
    constructor(){
	this.finished = false;
	
	this.onTrigger = function(hs, es, cursor, b){return false;};
	this.init = function(){return true};
	this.update = function(WASDKey, EnterKey, ShiftKey){return true};
	this.draw = function(){return true};
    }

}
