let globalStimulusDown = false;

/**
* A rare opportunity to document properly...
* A Stimulus is a DContainer -- on its own it has no graphics, these need to be added. But by default
* it includes all the necessary functions to be moved around, to call for re-compute, etc. 
* @param {String} type e.g. gabor, motion
* @param {Function} callback to be run each time the stimulus is moved
* @param {Number} x position
* @param {Number} y position
*/
class Stimulus extends DContainer {
	constructor (type,computeCallback,x=0,y=0) {
		super();

		this.type = type;
		this.callback = computeCallback;
		this.x = x;
		this.y = y;

		// internal tracking
		this.neverMoved = true;
		this.moved = false;
		this.isdown = false;

		this.interactive = true;
		// this is an override to prevent moving around the stimulus when, e.g. a control
		// is being pressed
		this.localPreventMotion = false;
		this
			.on('pointertap',this.clicked)
			.on('pointerdown',this.down)
			.on('pointerup',this.up)
			.on('pointerupoutside',this.up)
			.on('pointermove',this.move);

		this.controls = this.addChild(new DContainer());
		this.controls.zOrder = 100;
		this.controls.visible = false;

		// add contrast control (which just adjusts the alpha... derp)
		this.controls.contrastControl = this.controls.addChild(new PIXI.Graphics());
		this.drawContrastControlCircle(this.alpha);
		this.controls.contrastControl.interactive = true;
		this.controls.contrastControl
			.on('pointerdown',this.contrastControlDown)
			.on('pointerup',this.contrastControlUp)
			.on('pointerupoutside',this.contrastControlUp)
			.on('pointermove',this.contrastControlDown);
	}

	drawContrastControlCircle(alpha) {
		console.log(alpha)
		this.controls.contrastControl.clear();
		this.controls.contrastControl.lineStyle(1,0x000000,1);
		this.controls.contrastControl.moveTo(0,this._size);
		this.controls.contrastControl.lineTo(this._size*2,this._size);
		this.controls.contrastControl.beginFill(0x000000,1);
		this.controls.contrastControl.drawCircle(this._size*2*alpha,this._size,this._size/5);
	}

	contrastControlDown(event) {
		this.isdown = true;
		this.moved = false;
	}

	contrastControlUp() {
		this.isdown = false
		// set a timeout on the movement flag, otherwise we can't close out the controls
		// from the main object which is really annoying
		// (might be a better way to do this... not sure)
		let temp = this;
		setTimeout(function() {temp.moved=false;},100);
	}

	contrastControlMove(event) {
	  if (this.isdown) {
			this.moved = true;
			var pPos = this.parent.parent.getGlobalPosition();
	    var pos = event.data.global;

	    // *USE ANGLE FOR MOTION DIRECTION
	    // check the angle, then rotate the stimulus to match the angle
	    let theta = Math.atan2(pos.y-pPos.y,pos.x-pPos.x);
	    this.parent.parent.dots.dir = theta;

			// *USE HYPOTENUSE FOR MOTION COHERENCE
			let hypot = Math.hypot(pos.y-pPos.y,pos.x-pPos.x);
			hypot = Math.max(this.parent.parent._ecc,Math.min(this.parent.parent._ecc*2,hypot));
			this.parent.parent.dots.coherence = (hypot-this.parent.parent._ecc)/this.parent.parent._ecc;

	    // re-draw the circle
			this.parent.parent.drawMotionControlCircle(theta,hypot);
	  }
	}

	start() {
		let stimulus = this;
		ticker.add(function() {stimulus.draw(stimulus)});
	}

	draw() {
		// pass (will be overloaded by children)
	}

	showParamView() {
	  // if (this.isdown) {
			this.controls.visible = !this.controls.visible;
			// block sliding motion 
			this.localPreventMotion = this.controls.visible;
			// disable or re-enable interactivity on the stimulus container and other stimuli
			views.stim.container.interactive = !this.controls.visible; 
			for (var si=0;si<stimulus.length;si++) {
				if (stimulus[si]!=this) {
					stimulus[si].interactive = !this.controls.visible;
				}
			}
	  // }
	}

	/**
	* When clicked, check if we were moved -- if not open the parameter controls
	*/
	clicked() {
		if (!this.moved) {
			this.showParamView();
		}
	}

	down(event) {
		globalStimulusDown = true;
		this.moved = false;
		this.isdown = true;
		// track offset
		let pos = event.data.getLocalPosition(this.parent);
		this.offX = pos.x - this.x;
		this.offY = pos.y - this.y;
		// disable new stimulus creatino:
		cancelTouch=true;
	}

	up(event) {
		globalStimulusDown = false;
		this.isdown = false;
	}

	move(event) {
	  if (this.isdown && !this.localPreventMotion) {
			this.moved = true;
	    var pos = event.data.getLocalPosition(this.parent);
	  	let nx = Math.min(swidth-this.size,Math.max(-this.size,pos.x-this.offX)),
	  		ny = Math.min(sheight-this.size,Math.max(-this.size,pos.y-this.offY));
	    this.position.set(nx,ny);

	    // compute the percentage scrolled and use that to light up the menu
	    this.callback();
	  }
	}

	destroy() {
		console.log('TODO: Implement destroy -- remove from stimulus array');
		let temp = this;
		ticker.remove(function() {stimulus.draw(temp);});
		super.destroy();
	}

	get contrast() {
		return this.alpha;
	}

	set contrast(_contrast) {
		this.alpha = _contrast;
	}

	set size(size) {
		this.updateSize();
		this._size = size;
	}

	get size() {
		return this._size;
	}

	updateSize() {
		// Implement as children
	}
}