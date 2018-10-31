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

		this.pivot.set(width/2,height/2);

		// set id
		this.id = stimulus.length;

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

		this.stimulus = this.addChild(new DContainer());
		this.stimulus.zOrder = 99;

		this.controls = this.addChild(new DContainer());
		this.controls.zOrder = 100;
		this.controls.visible = false;

		this.controls.close = this.controls.addChild(new PIXI.Graphics());
		this.controls.close.interactive = true;
		let tempid = this.id;
		this.controls.close
			.on('click',function() {stimulus[tempid].destroy();});

		this.drawClose(this.controls.close,this.stimWidth);

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

		stimulus.push(this);
	}

	drawControls() {
		for (var i=0;i<this.controls.callbacks.length;i++) {
			this.controls.callbacks[i](this);
		}
	}

	drawClose(g,w) {
	  let rad = w*.1;
	  console.log(rad/3)
	  g.lineStyle(Math.min(1,rad/3),0xFF0000,1);
	  g.beginFill(0x000000,0);
	  g.drawCircle(w+rad,0,rad);
	  g.moveTo(w+rad*.3,rad*.3-rad);
	  g.lineTo(w+rad*1.7,rad*1.7-rad);
	  g.moveTo(w+2*rad-rad*.3,rad*.3-rad);
	  g.lineTo(w+2*rad-rad*1.7,rad*1.7-rad);
	}

	drawContrastControlCircle(object) {
		object.controls.contrastControl.clear();
		object.controls.contrastControl.lineStyle(1,0x000000,1);
		object.controls.contrastControl.moveTo(0,object.stimWidth/2);
		object.controls.contrastControl.lineTo(object.stimWidth,object.stimWidth/2);
		object.controls.contrastControl.lineStyle(1,16776960,1);
		object.controls.contrastControl.beginFill(16776960,1);
		object.controls.contrastControl.drawCircle(object.stimWidth*object.contrast,object.stimWidth/2,object.stimWidth/10);
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
	    let x = pos.x-pPos.x+this.parent.parent.stimWidth/2;	
	    this.parent.parent.contrast = Math.max(0.04,Math.min(1,x/this.parent.parent.stimWidth));
			this.parent.parent.drawControls();
			// recompute
			computePartialSensitivity();
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
		// check the moveFlag. This gets set by any of the control functions
		if (this.controlFlag) {return;}

		this.controls.visible = !this.controls.visible;
		// block sliding motion 
		this.localPreventMotion = this.controls.visible;
		// disable or re-enable interactivity on the stimulus container and other stimuli
		views.stim.container.interactive = !this.controls.visible; 
		for (var si=0;si<stimulus.length;si++) {
			if (stimulus[si]!=undefined && stimulus[si]!=this) {
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
		let temp = this;
		ticker.remove(function() {stimulus.draw(temp);});
		super.destroy();
		delete stimulus[this.id];
		// check if we need to re-enable interaction
		for (var si=0;si<stimulus.length;si++) {
			if (stimulus[si]!=undefined) {stimulus[si].interactive = true;}
		}
		// re-compute firing after removing this stimulus
		computePartialSensitivity();
	}

	get contrast() {
		return this.stimulus.alpha;
	}

	set contrast(_contrast) {
		this.stimulus.alpha = _contrast;
	}

	set size(size) {
		this.updateSize();
		this._size = size;
	}

	get size() {
		return this._size;
	}

	get pos() {
		// get position
		return {
			x:(this.x)*51/swidth-25,
			y:-((this.y)*51/sheight-25),
			rad:this.size*51/views.stim.container.width
		}
	}

	get pixPos() {
		return {
			x:this.x,
			y:this.y
		}
	}

	updateSize() {
		// Implement as children
	}
}