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
	constructor (type,computeCallback,x=0,y=0,width=0,height=0) {
		super();

		this.type = type;
		this.callback = computeCallback;
		this.x = x;
		this.y = y;
		this.zOrder = 0;

		// internal tracking
		this.neverMoved = true;
		this.moved = false;
		this.isdown = false;

		// settings that have to overloaded
		this.stimWidth=width;
		this.stimHeight=height;

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
		this.controls.contrastControl.interactive = true;
		this.controls.contrastControl
			.on('pointerdown',this.contrastControlDown)
			.on('pointerup',this.contrastControlUp)
			.on('pointerupoutside',this.contrastControlUp)
			.on('pointermove',this.contrastControlMove);

		this.controls.callbacks = [];
		this.controls.callbacks.push(this.drawContrastControlCircle);

		this.drawControls();

		// sort
		this.sortChildren();
	}

	drawControls() {
		for (var i=0;i<this.controls.callbacks.length;i++) {
			this.controls.callbacks[i](this);
		}
	}

	drawContrastControlCircle(object) {
		object.controls.contrastControl.clear();
		object.controls.contrastControl.lineStyle(1,0x000000,1);
		object.controls.contrastControl.moveTo(0,object.stimWidth/2);
		object.controls.contrastControl.lineTo(object.stimWidth,object.stimWidth/2);
		object.controls.contrastControl.beginFill(0x000000,1);
		object.controls.contrastControl.drawCircle(object.stimWidth*object.getAlpha(),object.stimWidth/2,object.stimWidth/5);
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
			this.parent.parent.controlFlag = true;
			var pPos = this.parent.parent.getGlobalPosition();
	    var pos = event.data.global;

	    // *USE X-POS FOR CONTRAST
	    let x = pos.x-pPos.x;	
	    let con = Math.max(0,Math.min(1,x/this.parent.parent.stimWidth));
	    this.parent.parent.updateAlpha(con);
			this.parent.parent.drawControls();
			// recompute
			computePartialSensitivity();
	  }
	}

	updateAlpha(alpha) {
		this.alpha = alpha;
	}

	getAlpha() {
		return this.alpha;
	}

	start() {
		let stimulus = this;
		ticker.add(function() {stimulus.draw(stimulus)});
	}

	draw() {
		// pass (will be overloaded by children)
	}

	showParamView() {
		// check the moveFlag. This gets set by any of the control functions
		if (this.controlFlag) {return;}


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

		this.drawControls();
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
		this.controlFlag = false;
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