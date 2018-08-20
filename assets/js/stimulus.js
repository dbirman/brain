/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight, deg2pix, pix2deg;

function initStimulus() {
	// Calculate the space the stimulus viewer will take up 
	swidth=views.stim.STIMULUS_W*ORIGIN_WIDTH, sheight=views.stim.STIMULUS_H*ORIGIN_HEIGHT;

	deg2pix = swidth/51;
	pix2deg = 51/swidth;

	views.stim.stimulusWindow = new DContainer();
	views.stim.container.addChild(views.stim.stimulusWindow);	
	views.stim.stimulusWindow.pivot.set(0,sheight/2);
	views.stim.stimulusWindow.position.set(10,ORIGIN_HEIGHT/2);

	// Allow flipping between views
	views.stim.stimulusWindow.interactive = true
	views.stim.stimulusWindow.on('pointertap',function() {checkDouble(this,getSwitchView('stim'));});

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
	let motion = views.stim.stimulusWindow.addChild(new Motion(0,0));


// 	ui_stim_container.addChild(stim);


// 	// create the mask
// 	stim.circmask = new PIXI.Graphics();
// 	stim.circmask.beginFill(0xFFFFFF,1);
// 	stim.circmask.drawCircle(stim.radius,stim.radius,stim.radius);
// 	stim.addChild(stim.circmask);

// 	stim.g = new PIXI.Graphics();
// 	stim.g.mask = stim.circmask;
// 	stim.addChild(stim.g);

// 	stim.dots = initDots(Math.PI*stim.radius**2/200,stim.radius*2,stim.radius*2,1,1,stim.theta,app.renderer.width/15,2);
// 	stim.position.set(150,150); // the true center is position+25/25

// 	return stim;
// }

}


class Motion extends Stimulus {
	constructor(x,y,radius) {
		super('motion',computePartialSensitivity,x,y);

		this.dots = new dots(50,radius*2,radius*2);
		this.addChild(this.dots.g);

		this._size = radius;

		this.mask = this.addChild(new PIXI.Graphics());
		this.mask.beginFill(0xFFFFFF,1);
		this.mask.drawCircle(this.size,this.size,this.size);

		this.dots.g.mask = this.mask;
	}

	draw() {
		if (this.dots!=undefined) {
			this.dots.update();
			this.dots.draw();
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
}



// Create the parameter window for the motion stimulus
// - this can be toggled on/off, but allows us to edit
// the properties of the stimulus, e.g. contrast/coherence etc
function updateMotionParams(stim,vis) {
	if (stim.paramWindow!=undefined) {stim.paramWindow.destroy();}

	let param_window = new PIXI.Container();
	stim.paramWindow = param_window;
	param_window.visible = vis;
	stim.addChild(param_window);

	// Create an actual window
	param_window.g = new PIXI.Graphics();
	param_window.g.beginFill(0xD3D3D3,1);
	param_window.g.lineStyle(1,0x000000,1);
	param_window.g.drawRect(75,0,100,150);
	param_window.g.moveTo(75,50);
	param_window.g.lineTo(175,50);
	param_window.g.moveTo(75,100);
	param_window.g.lineTo(175,100);
	param_window.addChild(param_window.g);

  var style = new PIXI.TextStyle({fill:'#000000',fontSize:15});
  var styleBig = new PIXI.TextStyle({fill:'#000000',fontSize:30});

	// Add theta/con/coh text
  var t = new PIXI.Text('Rotation (q/a)',style);
  t.position.set(75,0);
  param_window.addChild(t);
  var t = new PIXI.Text(Math.round(100*stim.getTheta())/100,styleBig);
  t.anchor.set(0.5,1);
  t.position.set(125,50);
  param_window.addChild(t);
  var t = new PIXI.Text('Contrast (w/s)',style);
  t.position.set(75,50);
  param_window.addChild(t);
  var t = new PIXI.Text(Math.round(100*stim.getContrast())+'%',styleBig);
  t.anchor.set(0.5,1);
  t.position.set(125,100);
  param_window.addChild(t);
  var t = new PIXI.Text('Coherence (e/d)',style);
  t.position.set(75,100);
  param_window.addChild(t);
  var t = new PIXI.Text(Math.round(100*stim.getCoherence())+'%',styleBig);
  t.anchor.set(0.5,1);
  t.position.set(125,150);
  param_window.addChild(t);

	return param_window;
}

//// Sensitivity computation

let sensTest = false, tg;

function computePartialSensitivity() {
	// For each electrode re-compute the sensitivity at the current parameters.
	// This is used when the parameters are being directly adjusted (e.g. size
	// contrast, coherence, etc)
	let ekeys = Object.keys(electrodes);

	if (sensTest) {
		if (tg!=undefined) {tg.destroy();}
		tg = new PIXI.Graphics();
		ui_stim_container.addChild(tg);
	}

	for (let ei = 0; ei < ekeys.length; ei++) {
		let electrode = electrodes[ekeys[ei]];

		let einfo = getElectrodePosition(electrode);

		if (einfo!=undefined) {	
			// Draw the x/y and radius for this electrode (testing)
			if (sensTest) {
				let vf_pos = getVisualFieldPosition(einfo.pos);

				tg.beginFill(0xFFFFFF,0.3);
				tg.drawCircle(vf_pos.x,vf_pos.y,deg2pix*einfo.rad);
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

function getElectrodePosition(elec) {
	if (elec.data.neuron==undefined) {
		console.log('neuron has no position - skip');
		return undefined;
	}
	return {pos: new PIXI.Point(elec.data.neuron[0],elec.data.neuron[1]), rad: elec.data.neuron[2]};
}

function getVisualFieldPosition(point) {
	let degx = point.x, degy = point.y;
	// convert from degrees to visual field position
	let vf_range = [-25,25];

	let x = (degx+25)/50*swidth,
		y = (25-degy)/50*sheight; // invert y position
	return new PIXI.Point(x,y);
}
