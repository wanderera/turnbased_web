class Button{
    constructor(x, y, width, height, fn){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.fn = fn; //pass the button's function
    }
}


class Menu{
    constructor(x, y, width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.buttons = [];
	this.bgImg = null;
	this.isOn = true;
	this.globalImgLoaded = false;
    }

    drawFullDisplay(){
	buffer.fillStyle = "darkgray";
	buffer.fillRect(this.x, this.y, this.width, this.height);

	buffer.font = '30px Arial';
	let textStr = "Enter 键开始";
	buffer.fillStyle = 'white';
	buffer.fillText(textStr,
			this.x + this.width/2 - buffer.measureText(textStr).width/2,
			this.y + this.height/2,)

	
	display.drawImage(buffer.canvas,
			  this.x, this.y, this.width, this.height,
			  0, 0, display.canvas.width, display.canvas.height);
    }


};
