/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight, deg2pix, pix2deg, horizdeg;

// caution -- this is used to track the offset of the stimulus drawing container
// relative to the stimulus, so that X/Y positions are rendered correctly
let globalStimulusOffset;

function initStimulus() {
	views.stim.container = views.container.addChild(new DContainer());
	views.stim.container.zOrder = 0;
	// Allow flipping between views
	views.stim.container.interactive = true;

	// Calculate the space the stimulus viewer will take up 
	sheight=views.stim.STIM_W*ORIGIN_H;
	swidth=views.stim.STIM_W*ORIGIN_W; // original calculation

	// now that the viewer is calculated, figure out the vertical degrees
	deg2pix = sheight/51; // use the height as the base
	pix2deg = 51/sheight;
	horizdeg = 1/deg2pix*swidth; // compute how wide the horizontal portion of the screen is

	// swidth = sheight;

	// set up the default starting location of the projector screen
	views.stim.container.x = views.buffer+views.stim.STIM_W*ORIGIN_W/2-swidth/2;
	globalStimulusOffset = views.stim.container.x;
	views.stim.container.y = views.buffer+ORIGIN_H/2-sheight/2-sheight*0.2;
	views.stim.standHeight = sheight*0.4; // 30% above, 70% below
	views.stim.fullHeight = sheight*0.5;

	views.stim.container.resetX = views.stim.container.x;
	views.stim.container.resetY = views.stim.container.y;

	// initialize stimulusBackground
	views.stim.stimulusBackground = views.stim.container.addChild(new DContainer());
	views.stim.stimulusBackground.pivot.set(0,0);
	views.stim.stimulusBackground.position.set(0,0);
	views.stim.stimulusBackground.zOrder = -1;

	// Draw the stimulus stage -- a large box on the left (visual field) and then 
	// a box on the right for the stimulus buttons
	// and a third box for the parameters

	// Because the stimulus region has its own graphics objects for each of tehse we'll draw
	// them all at once
	let g = new PIXI.Graphics();
	// // Save graphics
	views.stim.stimulusBackground.addChild(g);
	views.stim.graphics = g;

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

	drawStimulusBackground();

	// tack on the bucket to enable/disable flagging
	let sprite = views.stim.stimulusBackground.addChild(new PIXI.Sprite.fromImage('./assets/bucket.png'));
	sprite.anchor.set(0,1);
	sprite.x = swidth * 0.05;
	sprite.y = views.stim.fullHeight+sheight*1.02;
	sprite.scale.set(sprite.width/ORIGIN_W*1.35);
	sprite.alpha = 0.2;
	sprite.interactive = true;
	sprite
		.on('pointertap',flipFlagging);

	views.stim.bucket = sprite;

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
  var style = new PIXI.TextStyle({fill:'#000000',fontSize:20,fontFamily:views.static.FAMILY});
  var t = new PIXI.Text('Left visual field',style);
  t.anchor.set(0.5,0);
  t.position.set(swidth/4,0);
  views.stim.stimulusWindow.addChild(t);
  var t = new PIXI.Text('Right visual field',style);
  t.anchor.set(0.5,0);
  t.position.set(swidth*3/4,0);
  views.stim.stimulusWindow.addChild(t);

  // add graphic (+ sign in a circle)

  views.stim.addGraphic = views.stim.stimulusWindow.addChild(new PIXI.Graphics());
  // views.stim.addGraphic
  let rad = ORIGIN_W*.015;
  let off = rad*.2;
  views.stim.addGraphic.lineStyle(rad/8,0x000000,1);
  views.stim.addGraphic.beginFill(0x000000,0);
  views.stim.addGraphic.drawCircle(off+rad,off+rad,rad);
  views.stim.addGraphic.interactive = true;
  views.stim.addGraphic.moveTo(off+rad*.3,off+rad);
  views.stim.addGraphic.lineTo(off+rad*1.7,off+rad);
  views.stim.addGraphic.moveTo(off+rad,off+rad*.3);
  views.stim.addGraphic.lineTo(off+rad,off+rad*1.7);
  views.stim.addGraphic
  	// .on('click',function() {addStimulusWindow(swidth/2,sheight/2)});
  	.on('pointertap',function() {addStimulusWindow(swidth/2,sheight/2)});	

  // var t = new PIXI.Text('Touch and hold to add',style);
  // t.anchor.set(0.5,0.5);
  // t.position.set(swidth/2,sheight/2);
  // views.stim.stimulusWindow.addChild(t);
  // views.stim.touchText = t; // we want to delete this later


  // create the adding view and make it invisible
  views.stim.addContainer = app.stage.addChild(new DContainer());
  views.stim.addContainer.zOrder = 99;
  views.stim.addContainer.interactive = true;
  views.stim.addContainer
  	.on('pointertap',resolveStimulusWindow);
  views.stim.addContainer.visible = false;

  // add the mask full-size window
  let ginvis = views.stim.addContainer.addChild(new PIXI.Graphics());
  ginvis.beginFill(0xFFFFFF,0.8);
  ginvis.drawRect(0,0,ORIGIN_WIDTH,ORIGIN_HEIGHT);

  stimX = [-1,0,1];
  stimTypes = ['dot','gabor','motion'];
  stimCallbacks = [pickGaussian,pickGabor,pickMotion];

  for (var si=0;si<stimTypes.length;si++) {
	  let temp = views.stim.addContainer.addChild(new PIXI.Sprite.fromImage('./assets/stim_ex/'+stimTypes[si]+'.png'));
	  temp.anchor.set(0.5,0.5);
	  temp.x = views.buffer + ORIGIN_W/2 + swidth/4*stimX[si];
	  temp.y = views.buffer + ORIGIN_H/2;
	  temp.width = swidth/4;
	  temp.height = swidth/4;
	  temp.interactive = true;
	  temp.m = temp.addChild(new PIXI.Graphics());
	  temp.m.drawCircle(swidth/4,swidth/4,swidth/4);
	  temp
	  	.on('pointertap',stimCallbacks[si]);
  }

  // views.stim.addContainer.addGabor = views.stim.addContainer.addChild(new PIXI.Sprite.fromImage('./assets/stim_ex/gabor.png'));
  // views.stim.addContainer.addGabor.scale.set(swidth/8 / views.stim.addContainer.addGabor.width);


  // make sure to sort
  views.stim.container.sortChildren();
}

function drawStimulusBackground() {
	// draw a grey background
	views.stim.graphics.lineStyle(1,0x000000,1);
	views.stim.graphics.beginFill(con2bin_gamma(0.5),1);
	views.stim.graphics.drawRect(0,views.stim.standHeight*0.3,swidth,sheight);
	// draw a dashed line down the center
	views.stim.graphics.lineStyle(1,0x000000,1);
	for (let i=views.stim.standHeight*0.3+5;i<(views.stim.standHeight*0.3+sheight);i+=sheight/20) {
		views.stim.graphics.moveTo(swidth/2,i);
		views.stim.graphics.lineTo(swidth/2,i+10);
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ADDING NEW STIMULI
// //////////////////////////// //////////////////////////// //////////////////////////// //

let newStimX,newStimY;

function resolveStimNum() {
	var count = 0;
	for (var i=0;i<stimulus.length;i++) {
		count += stimulus[i]!=undefined ? 1 : 0;
	}
	
	views.stim.addGraphic.alpha = count>=views.maxStim ? 0.1 : 1;
}

function addStimulusWindow(x,y) {
	newStimX = x,
	newStimY = y;

	// check how many of stimulus are undefined
	if (stimulus.length>=views.maxStim) {
		let count = 0;
		for (var si=0;si<stimulus.length;si++) {
			stimulus[si]==undefined ? count : count++;
		}
		if (count>=views.maxStim) {
			return;
		}
	}

	// temporarily blank out the stimulus window and remove interaction
	views.container.interactive = false;

	// open up the add window
	views.stim.addContainer.visible = true;
}

function pickMotion() {
	createMotionStimulus(newStimX,newStimY);
}

function pickGaussian() {
	createGaussianStimulus(newStimX,newStimY);
}

function pickGabor() {
	createGaborStimulus(newStimX,newStimY);
}

function addStimulusWindow_() {
	// show the add view
	views.stim.addContainer.visible = true;
}

function resolveStimulusWindow() {
	views.stim.addContainer.visible = false;
	views.container.interactive = true;
}


// //////////////////////////// //////////////////////////// //////////////////////////// //
// GAUSSIAN BLOB
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createGaussianStimulus(x=0,y=0,rad=deg2pix*2) {
	var gaussian = views.stim.stimulusWindow.addChild(new Gaussian(x-rad,y-rad,rad));
	gaussian.start(); // you still have to start -- otherwise it doesn't draw
	// technically with the gaussian you don't need to re-draw each frame...
}

class Gaussian extends Stimulus {
	constructor(x,y,radius) {
		super('gaussian',computePartialSensitivity,x,y,radius*2,radius*2);


		this._size = radius;
		this._ecc = this._size+this._size/5 

		this.graphics = this.stimulus.addChild(new PIXI.Graphics());

		this.sortChildren();
	}

	draw(gaussian) {
		gaussian.graphics.clear();
		gaussian.graphics.beginFill(0xFFFFFF,1);
		gaussian.graphics.drawCircle(gaussian.size,gaussian.size,gaussian.size);
	}
}
// //////////////////////////// //////////////////////////// //////////////////////////// //
// GABORS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createGaborStimulus(x=0,y=0,rad=deg2pix*2.5) {
	var gabor = views.stim.stimulusWindow.addChild(new Gabor(x-rad,y-rad,rad));
	gabor.start();
}

class Gabor extends Stimulus {
	constructor(x,y,radius) {
		super('gabor',computePartialSensitivity,x,y,radius*2,radius*2);

		this._size = radius;
		this._ecc = this._size+this._size/5 

		this.graphics = this.stimulus.addChild(new PIXI.Graphics());

		this.graphics.pivot.set(this.size,this.size);
		this.graphics.position.set(this.size,this.size);

		// var scale = normpdf(0,0,this.size/4);
		// for (var x=0;x<(this.size*2);x++) {
		// 	for (var y=0;y<(this.size*2);y++) {
		// 		var d = hypot(x,this.size,y,this.size);
		// 		var alpha = normpdf(d,x/2,this.size/4)/scale;
		// 		var color;
		// 		if (y < (this.size-this.size/8)) {
		// 			color = 0xFFFFFF;
		// 		} else {
		// 			color = 0x000000;
		// 		}
		// 		color=0xFFFFFF;
		// 		this.graphics.beginFill(con2bin(alpha),alpha);
		// 		this.graphics.drawRect(x,y,1,1);
		// 	}
		// }

		// draw a white bar in the middle
		this.graphics.beginFill(0xFFFFFF,1);
		this.graphics.drawRect(0,this.size-this.size/8,this.size*2,this.size/4);
		// draw two white bars above and below
		this.graphics.drawRect(this.size/2,this.size/2-this.size/8,this.size,this.size/4);
		this.graphics.drawRect(this.size/2,this.size*3/2-this.size/8,this.size,this.size/4);
		this.graphics.beginFill(0x000000,1);
		this.graphics.drawRect(this.size/3,this.size*3/4-this.size/8,this.size*4/3,this.size/4);
		this.graphics.drawRect(this.size/3,this.size*5/4-this.size/8,this.size*4/3,this.size/4);

		// // add a gaussian mask
		// g = new PIXI.Graphics();
		// g.beginFill(0x000000,0);
		// var scale = normpdf(0,0,this.size/4);
		// for (var x=0;x<(this.size*2);x++) {
		// 	for (var y=0;y<(this.size*2);y++) {
		// 		// var d = hypot(x,x/2,y,y/2);
		// 		// var alpha = normpdf(d,x/2,this.size/4)/scale;
		// 		// console.log(alpha);
		// 		// g.beginFill(con2bin(alpha),1);
		// 		g.drawRect(x,y,1,1);
		// 	}
		// }
		// g.endFill();
		// this.addChild(g);
		// this.graphics.mask = g;

		this.controls.motionControl = this.controls.addChild(new PIXI.Graphics());
		// this.drawMotionControlCircle(this.dots.dir,this._ecc);
		this.controls.motionControl.interactive = true;
		this.controls.motionControl
			.on('pointerdown',this.motionControlDown)
			.on('pointerup',this.motionControlUp)
			.on('pointerupoutside',this.motionControlUp)
			.on('pointermove',this.motionControlMove);
		this.controls.callbacks.push(this.drawMotionControlCircle);

		this.dir = 0;

		this.sortChildren();
	}

	draw(gabor) {
		gabor.graphics.rotation = gabor.dir;
	}

	drawMotionControlCircle(object) {
		let angle = object.dir,
			dist = object._ecc;

		object.controls.motionControl.clear();
		// compute position
		let xang = Math.cos(angle),
			yang = Math.sin(angle);
		let x = object._size + dist * xang,
			y = object._size + dist * yang;
		object.controls.motionControl.lineStyle(1,0x000000,0);
		object.controls.motionControl.beginFill(0xFF0000,1);
		object.controls.motionControl.drawCircle(x,y,object._size/4);
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
		var temp = this;
		setTimeout(function() {temp.moved=false;},100);
	}

	motionControlMove(event) {
	  if (this.isdown) {
			this.moved = true;
			this.parent.parent.controlFlag = true;
			var pPos = this.parent.parent.getGlobalPosition();
	    var pos = event.data.global;

	    // *USE ANGLE FOR MOTION DIRECTION
	    // check the angle, then rotate the stimulus to match the angle
	    var theta = Math.atan2(pos.y-pPos.y,pos.x-pPos.x);
	    this.parent.parent.dir = theta;

			// *USE HYPOTENUSE FOR MOTION COHERENCE
			// var hypot = Math.hypot(pos.y-pPos.y,pos.x-pPos.x);
			// hypot = Math.max(this.parent.parent._ecc,Math.min(this.parent.parent._ecc*2,hypot));

	    // re-draw the circle
			this.parent.parent.drawControls();

			// recompute
			computePartialSensitivity();
	  }
	}

	motionControls() {
		if (!this.isdown && !this.moved && !this.controls.motionControl.moved) {
			
		}
	}

	get theta() {
		return this.dir;
	}

	set theta(_theta) {
		this.dir = _theta;
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MOTION
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createMotionStimulus(x=0,y=0,rad=deg2pix*4) {
	var motion = views.stim.stimulusWindow.addChild(new Motion(x-rad,y-rad,rad));
	motion.start();
}

class Motion extends Stimulus {
	constructor(x,y,radius) {
		super('motion',computePartialSensitivity,x,y,radius*2,radius*2);

		this.dots = new dots(25,radius*2,radius*2,0,-Math.PI/2,swidth*5/51,2);
		this.stimulus.addChild(this.dots.g);

		this._size = radius;
		this._ecc = this._size+this._size/5 

		this.mask_ = this.addChild(new PIXI.Graphics());
		this.mask_.beginFill(0xFFFFFF,1);
		this.mask_.drawCircle(this.size,this.size,this.size);

		this.dots.g.mask = this.mask_;

		this.controls.motionControl = this.controls.addChild(new PIXI.Graphics());
		// this.drawMotionControlCircle(this.dots.dir,this._ecc);
		this.controls.motionControl.interactive = true;
		this.controls.motionControl
			.on('pointerdown',this.motionControlDown)
			.on('pointerup',this.motionControlUp)
			.on('pointerupoutside',this.motionControlUp)
			.on('pointermove',this.motionControlMove);
		this.controls.callbacks.push(this.drawMotionControlCircle);

		this.sortChildren();
	}

	drawMotionControlCircle(object) {
		let angle = object.dots.dir,
			dist = object._size+object.dots.coherence*object._ecc;

		object.controls.motionControl.clear();
		// compute position
		let xang = Math.cos(angle),
			yang = Math.sin(angle);
		let x = object._size + dist * xang,
			y = object._size + dist * yang;
		object.controls.motionControl.lineStyle(1,0x000000,1);
		object.controls.motionControl.moveTo(object._size+object._ecc*xang,object._size+object._ecc*yang);
		object.controls.motionControl.lineTo(object._size+object._ecc*2*xang,object._size+object._ecc*2*yang);
		object.controls.motionControl.lineStyle(1,0x000000,0);
		object.controls.motionControl.beginFill(0xFF0000,1);
		object.controls.motionControl.drawCircle(x,y,object._size/4);
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
			this.parent.parent.controlFlag = true;
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
			this.parent.parent.drawControls();

			// recompute
			computePartialSensitivity();
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

	get contrast() {
		return this.dots ? this.dots.alpha : this.alpha;
	}

	set contrast(_contrast) {
		this.dots.alpha = _contrast;
	}
}

//// Sensitivity computation

let sensTest = false, tg;
let flagging = false;

function flipFlagging() {
	flagging = !flagging;
	views.stim.bucket.alpha = flagging ? 1 : 0.2;
	if (!flagging) {
		drawStimulusBackground();
	}
}

function computePartialSensitivity() {
	// For each electrode re-compute the sensitivity at the current parameters.
	// This is used when the parameters are being directly adjusted (e.g. size
	// contrast, coherence, etc)

	if (sensTest) {
		if (tg!=undefined) {
			tg.clear();
		} else {
			tg = views.stim.stimulusWindow.addChild(new PIXI.Graphics());
		}
	}

	for (let ei = 0; ei < electrodes.length; ei++) {
		let electrode = electrodes[ei];
		let e_pos = electrode.pos();

		if (electrode.data.neuron==undefined) {
			electrode.setRate(0);
		} else if (e_pos!=undefined) {
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
				if (stimulus[si]!=undefined) {
					let sResp = areas[area].func(electrode,stimulus[si]);
					// check if we should tag this region
					if (flagging && sResp > 1) {
						views.stim.graphics.lineStyle(0,0x000000,1);
						views.stim.graphics.beginFill(electrode.color,Math.pow(sResp/50,2));
						let stimPos = stimulus[si].pixPos;
						views.stim.graphics.drawRect(0+stimPos.x-1,views.stim.standHeight*0.3+stimPos.y-1,3,3);
					}
					response += sResp;
				}
			}
			// Set the spike rate
			response = response==-1 ? 0.5 : response;
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

