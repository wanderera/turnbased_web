// Frank Poth 12/23/2017

const SPRITE_SIZE = 16;


class Animation{
    constructor(frame_set, delay){
	this.count = 0;// Counts the number of game cycles since the last frame change.
	this.delay = delay;// The number of game cycles to wait until the next frame change.
	this.frame = 0;// The value in the sprite sheet of the sprite image / tile to display.
	this.frame_index = 0;// The frame's index in the current animation frame set.
	this.frame_set = frame_set;// The current animation frame set that holds sprite tile values.
    }

	/* This changes the current animation frame set. For example, if the current
	   set is [0, 1], and the new set is [2, 3], it changes the set to [2, 3]. It also
	   sets the delay. */
    change(frame_set, delay = 15){
	if (this.frame_set != frame_set) {// If the frame set is different:

	    this.count = 0;// Reset the count.
	    this.delay = delay;// Set the delay.
	    this.frame_index = 0;// Start at the first frame in the new frame set.
	    this.frame_set = frame_set;// Set the new frame set.
	    this.frame = this.frame_set[this.frame_index];// Set the new frame value.
	}
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


