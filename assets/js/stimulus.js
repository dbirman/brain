/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight, deg2pix, pix2deg;

function initStimulus() {
	views.stim.container = views.container.addChild(new DContainer());
	views.stim.container.zOrder = 0;
	// Allow flipping between views
	views.stim.container.interactive = true;

	// Calculate the space the stimulus viewer will take up 
	swidth=views.stim.STIM_W*ORIGIN_W, sheight=views.stim.STIM_W*ORIGIN_H;

	// set up the default starting location of the projector screen
	views.stim.container.x = views.buffer;
	views.stim.container.y = views.buffer+ORIGIN_H/2-sheight/2-sheight*0.2;
	views.stim.standHeight = sheight*0.4; // 30% above, 70% below
	views.stim.fullHeight = sheight*0.5;

	views.stim.container.resetX = views.stim.container.x;
	views.stim.container.resetY = views.stim.container.y;

	deg2pix = swidth/51;
	pix2deg = 51/swidth;

	// initialize stimulusBackground
	views.stim.stimulusBackground = views.stim.container.addChild(new DContainer());
	views.stim.stimulusBackground.pivot.set(0,0);
	views.stim.stimulusBackground.position.set(0,0);
	views.stim.stimulusBackground.zOrder = -1;

	// add interactino for adding new stimuli
	views.stim.stimulusBackground.interactive = true;
	views.stim.stimulusBackground
		.on('pointerdown',addStimCallback)
		.on('pointerup',addStimUp)
		.on('pointerupoutside',addStimUp);

	// Draw the stimulus stage -- a large box on the left (visual field) and then 
	// a box on the right for the stimulus buttons
	// and a third box for the parameters

	// Because the stimulus region has its own graphics objects for each of tehse we'll draw
	// them all at once
	let g = new PIXI.Graphics();

	// draw the vertical stand
	g.lineStyle(10,0x000000,1);
	g.moveTo(swidth/2,0);
	g.lineTo(swidth/2,sheight+views.stim.standHeight);
	// add the legs
	g.lineStyle(8,0x000000,1);
	g.moveTo(swidth/2,sheight+views.stim.standHeight*0.5);
	g.lineTo(swidth/2-swidth*0.2,sheight+views.stim.fullHeight);
	g.moveTo(swidth/2,sheight+views.stim.standHeight*0.5);
	g.lineTo(swidth/2+swidth*0.2,sheight+views.stim.fullHeight);
	// add the little supports
	g.lineStyle(2,0x000000,1);
	g.moveTo(swidth/2,sheight+views.stim.standHeight*0.95);
	g.lineTo(swidth/2-swidth*0.1,sheight+views.stim.fullHeight/1.5);
	g.moveTo(swidth/2,sheight+views.stim.standHeight*0.95);
	g.lineTo(swidth/2+swidth*0.1,sheight+views.stim.fullHeight/1.5);

	// draw a grey background
	g.lineStyle(1,0x000000,1);
	g.beginFill(0xD3D3D3,1);
	g.drawRect(0,views.stim.standHeight*0.3,swidth,sheight);
	// draw a black line across the top (like a projector screen dropout)
	// g.lineStyle(15,0x000000,1);
	// g.moveTo(0,views.stim.standHeight*0.3-8);
	// g.lineTo(swidth+1,views.stim.standHeight*0.3-8);
	// draw a dashed line down the center
	g.lineStyle(1,0x000000,1);
	for (let i=views.stim.standHeight*0.3+5;i<(views.stim.standHeight*0.3+sheight);i+=sheight/20) {
		g.moveTo(swidth/2,i);
		g.lineTo(swidth/2,i+10);
	}
	// // Save graphics
	views.stim.stimulusBackground.addChild(g);
	views.stim.graphics = g;

	views.stim.stimulusWindow = views.stim.container.addChild(new DContainer());
	views.stim.stimulusWindow.pivot.set(0,0);
	views.stim.stimulusWindow.position.set(0,views.stim.standHeight*0.3);
	views.stim.stimulusWindow.zOrder = 1;

	// Set up a mask to cut off the edges of any stimulus

	let mask = views.stim.stimulusWindow.addChild(new PIXI.Graphics());
	mask.beginFill(0xFFFFFF,1);
	mask.drawRect(0,0,swidth,sheight);

	views.stim.stimulusWindow.mask = mask;

	// Add some text to the stimulus window
  var style = new PIXI.TextStyle({fill:'#000000',fontSize:20});
  var t = new PIXI.Text('Left visual field',style);
  t.anchor.set(0.5,0);
  t.position.set(swidth/4,0);
  views.stim.stimulusWindow.addChild(t);
  var t = new PIXI.Text('Right visual field',style);
  t.anchor.set(0.5,0);
  t.position.set(swidth*3/4,0);
  views.stim.stimulusWindow.addChild(t);


  var t = new PIXI.Text('Touch and hold to add',style);
  t.anchor.set(0.5,0.5);
  t.position.set(swidth/2,sheight/2);
  views.stim.stimulusWindow.addChild(t);
  views.stim.touchText = t; // we want to delete this later


  // create the adding view and make it invisible
  views.stim.addContainer = app.stage.addChild(new DContainer());
  views.stim.addContainer.zOrder = 99;
  views.stim.addContainer.interactive = true;
  views.stim.addContainer
  	.on('pointertap',resolveStimulusWindow);

  views.stim.addContainer.addMotion = views.stim.addContainer.addChild(new PIXI.Sprite.fromImage('./assets/stim_ex/motion.png'));
  views.stim.addContainer.addMotion.anchor.set(0.5,0.5);
  views.stim.addContainer.addMotion.x = views.buffer + ORIGIN_W/2;
  views.stim.addContainer.addMotion.y = views.buffer + ORIGIN_H/2;
  views.stim.addContainer.addMotion.width = swidth/4;
  views.stim.addContainer.addMotion.height = swidth/4;
  views.stim.addContainer.addMotion.interactive = true;
  views.stim.addContainer.addMotion
  	.on('pointertap',pickMotion);

  // views.stim.addContainer.addGabor = views.stim.addContainer.addChild(new PIXI.Sprite.fromImage('./assets/stim_ex/gabor.png'));
  // views.stim.addContainer.addGabor.scale.set(swidth/8 / views.stim.addContainer.addGabor.width);

  views.stim.addContainer.visible = false;

  // make sure to sort
  views.stim.container.sortChildren();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ADDING NEW STIMULI
// //////////////////////////// //////////////////////////// //////////////////////////// //

let cancelTouch = false;

function addStimCallback(event) {
	// check if the pointer is down on a stimulus
	if (globalStimulusDown) {return;}

	if (spikes.length==0) {
		uiElecInitSpikes();
	}

	this.isdown = true;

  var pos = event.data.getLocalPosition(this.parent);
  this.offX = pos.x - this.x;
  this.offY = pos.y - this.y;

	setTimeout(function() {addStimulusWindow(pos.x,pos.y)},600);
}

function addStimUp() {
	this.isdown = false;
	cancelTouch = false;
}

function addStimulusWindow(x,y) {
	if (views.stim.stimulusBackground.isdown && !cancelTouch) {
		if (!views.stim.touchText._destroyed) {views.stim.touchText.destroy();}
		
		if (stimulus.length>=4) {
			return;
		}

		// temporarily blank out the stimulus window and remove interaction
		views.container.alpha = 0.1;
		views.container.interactive = false;

		// open up the add window
		views.stim.addContainer.visible = true;
	}
}

function pickMotion() {
	createMotionStimulus(views.stim.stimulusBackground.offX,views.stim.stimulusBackground.offY);
	resolveStimulusWindow();
}

function addStimulusWindow_() {
	// show the add view
	views.stim.addContainer.visible = true;
}

function resolveStimulusWindow() {
	console.log('here')
	views.stim.addContainer.visible = false;
	views.container.alpha = 1;
	views.container.interactive = true;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// GABORS
// //////////////////////////// //////////////////////////// //////////////////////////// //


// //////////////////////////// //////////////////////////// //////////////////////////// //
// MOTION
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createMotionStimulus(x=0,y=0,rad=50) {
	console.log('here')
	motion = views.stim.stimulusWindow.addChild(new Motion(x-rad,y-rad,rad));
	motion.start();

	stimulus.push(motion);
}

class Motion extends Stimulus {
	constructor(x,y,radius) {
		super('motion',computePartialSensitivity,x,y);

		this.dots = new dots(25,radius*2,radius*2,0,0,swidth*5/51,5);
		this.addChild(this.dots.g);

		this.pivot.set(radius,radius);

		this._size = radius;
		this._ecc = this._size+this._size/5 

		this.mask_ = this.addChild(new PIXI.Graphics());
		this.mask_.beginFill(0xFFFFFF,1);
		this.mask_.drawCircle(this.size,this.size,this.size);

		this.dots.g.mask = this.mask_;

		this.controls.motionControl = this.controls.addChild(new PIXI.Graphics());
		this.drawMotionControlCircle(this.dots.dir,this._ecc);
		this.controls.motionControl.interactive = true;
		this.controls.motionControl
			.on('pointerdown',this.motionControlDown)
			.on('pointerup',this.motionControlUp)
			.on('pointerupoutside',this.motionControlUp)
			.on('pointermove',this.motionControlMove);

		this.sortChildren();
	}

	drawMotionControlCircle(angle,dist) {
		this.controls.motionControl.clear();
		// compute position
		let xang = Math.cos(angle),
			yang = Math.sin(angle);
		let x = this._size + dist * xang,
			y = this._size + dist * yang;
		this.controls.motionControl.lineStyle(1,0x000000,1);
		this.controls.motionControl.moveTo(this._size+this._ecc*xang,this._size+this._ecc*yang);
		this.controls.motionControl.lineTo(this._size+this._ecc*2*xang,this._size+this._ecc*2*yang);
		this.controls.motionControl.beginFill(0xFF0000,1);
		this.controls.motionControl.drawCircle(x,y,this._size/5);
	}

	motionControlDown(event) {
		this.isdown = true;
		this.moved = false;
	}

	motionControlUp() {
		this.isdown = false
		// set a timeout on the movement flag, otherwise we can't close out the controls
		// from the main object which is really annoying
		// (might be a better way to do this... not sure)
		let temp = this;
		setTimeout(function() {temp.moved=false;},100);
	}

	motionControlMove(event) {
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

	motionControls() {
		if (!this.isdown && !this.moved && !this.controls.motionControl.moved) {
			
		}
	}

	draw(motion) {
		if (motion.dots!=undefined) {
			motion.dots.update();
			motion.dots.draw();
		}
	}

	get theta() {
		return this.dots.dir;
	}

	set theta(_theta) {
		this.dots.dir = _theta;
	}

	get coherence() {
		return this.dots.coherence;
	}

	set coherence(_coherence) {
		this.dots.coherence = _coherence;
	}

	get pos() {
		// get position
		return {
			x:(this.x+this.size)*51/swidth-25,
			y:-((this.y+this.size)*51/sheight-25),
			rad:this.size*51/views.stim.container.width
		}
	}
}

//// Sensitivity computation

let sensTest = true, tg;

function computePartialSensitivity() {
	// For each electrode re-compute the sensitivity at the current parameters.
	// This is used when the parameters are being directly adjusted (e.g. size
	// contrast, coherence, etc)

	if (sensTest) {
		if (tg!=undefined) {tg.destroy();}
		tg = views.stim.stimulusWindow.addChild(new PIXI.Graphics());
	}

	for (let ei = 0; ei < electrodes.length; ei++) {
		let electrode = electrodes[ei];
		let e_pos = electrode.pos();

		if (e_pos!=undefined) {	

			// Draw the x/y and radius for this electrode (testing)
			if (sensTest) {
				let vf_pos = getVisualFieldPosition(e_pos);

				tg.beginFill(0xFFFFFF,0.3);
				tg.drawCircle(vf_pos.x,vf_pos.y,deg2pix*e_pos.rad);
			}

			// Get the area
			let area = electrode.data.neuron[4];

			// Compute response to each stimulus
			let response = 0;
			for (let si = 0; si < stimulus.length; si++) {
				response += areas[area].func(electrode,stimulus[si]);
			}

			// Set the spike rate
			electrode.setRate(response);
		}
	}
}

// POSITION FUNCTIONS

function getVisualFieldPosition(point) {
	let degx = point.x, degy = point.y;
	// convert from degrees to visual field position
	let vf_range = [-25,25];

	let x = (degx+25)/50*swidth,
		y = (25-degy)/50*sheight; // invert y position
	return new PIXI.Point(x,y);
}

