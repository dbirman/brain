/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight, deg2pix, pix2deg;

function initStimulus() {
	views.stim.container = app.stage.addChild(new DContainer());
	// Allow flipping between views
	views.stim.container.interactive = true;

	views.stim.container.x = views.buffer;
	views.stim.container.y = views.buffer;

	views.stim.container.resetX = views.stim.container.x;
	views.stim.container.resetY = views.stim.container.y;

	// Calculate the space the stimulus viewer will take up 
	swidth=views.stim.STIM_W*ORIGIN_W, sheight=views.stim.STIM_W*ORIGIN_H;

	deg2pix = swidth/51;
	pix2deg = 51/swidth;

	views.stim.stimulusWindow = views.stim.container.addChild(new DContainer());
	views.stim.stimulusWindow.pivot.set(0,sheight/2);
	views.stim.stimulusWindow.position.set(0,ORIGIN_H/2);

	// Draw the stimulus stage -- a large box on the left (visual field) and then 
	// a box on the right for the stimulus buttons
	// and a third box for the parameters

	// Because the stimulus region has its own graphics objects for each of tehse we'll draw
	// them all at once
	g = new PIXI.Graphics();

	g.lineStyle(1,0x000000,1);
	g.beginFill(0x7F7F7F,1);
	g.drawRect(0,0,swidth,sheight);
	g.moveTo(swidth/2,0);
	g.lineTo(swidth/2,sheight);

	// Save graphics
	views.stim.stimulusWindow.addChild(g);
	views.stim.graphics = g;

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
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// GABORS
// //////////////////////////// //////////////////////////// //////////////////////////// //


// //////////////////////////// //////////////////////////// //////////////////////////// //
// MOTION
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createMotionStimulus() {
	motion = views.stim.stimulusWindow.addChild(new Motion(0,0,50));
	motion.start();

	stimulus.push(motion);
}


class Motion extends Stimulus {
	constructor(x,y,radius) {
		super('motion',computePartialSensitivity,x,y);

		this.dots = new dots(50,radius*2,radius*2,1,0,swidth*5/51,2);
		this.addChild(this.dots.g);

		this.interactive = true;
		this.on('pointertap',this.motionControls);

		this._size = radius;

		this.mask = this.addChild(new PIXI.Graphics());
		this.mask.beginFill(0xFFFFFF,1);
		this.mask.drawCircle(this.size,this.size,this.size);

		this.dots.g.mask = this.mask;
	}

	motionControls() {
		console.log('controls pop-up!');
	}

	draw(motion) {
		if (motion.dots!=undefined) {
			motion.dots.update();
			motion.dots.draw();
		}
	}

	get theta() {
		return this.dots.theta;
	}

	set theta(_theta) {
		this.dots.theta = _theta;
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
			x:this.x*51/views.stim.container.width-25,
			y:this.y*51/views.stim.container.height-25,
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
		tg = views.stim.container.addChild(new PIXI.Graphics());
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
				response += areas[area].func(e_pos,stimulus[si]);
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
