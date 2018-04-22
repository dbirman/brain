/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight;

function initStimulus() {
	swidth=VIS_SCALEH*app.renderer.width, sheight=0.9*BRAIN_SCALEV*app.renderer.height-30;
	swidth = Math.min(swidth,sheight);
	sheight = swidth;


	let x = 10, y = MENU_SCALEV*app.renderer.height+(BRAIN_SCALEV*app.renderer.height-sheight)/2;
	
	ui_stim_container.position.set(x,y);

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

	ui_stim_container.addChild(g);

  var style = new PIXI.TextStyle({fill:'#000000',fontSize:20});
  var t = new PIXI.Text('Left visual field',style);
  t.anchor.set(0.5,0);
  t.position.set(swidth/4,0);
  ui_stim_container.addChild(t);
  var t = new PIXI.Text('Right visual field',style);
  t.anchor.set(0.5,0);
  t.position.set(swidth*3/4,0);
  ui_stim_container.addChild(t);

	stimulus_graphic = g;

	// Setup the event listener functions

  document.body.onkeydown = function(e){checkKey(e);};
}

function checkKey(e) {
	console.log(e.keyCode);

  if (any(equals([72,77],e.keyCode))) {e.preventDefault();}

  if (e.keyCode==77) {
  	stimulus.push(createMotionStimulus());
  	drawMotionStimulus(stimulus.length-1);
  }

  if (e.keyCode==72) {
  	if (document.getElementById('help').style.display=='none') {
  		document.getElementById('help').style.display='block';
  	} else {
  		document.getElementById('help').style.display='none';
  	}
  }
}

//// stimulus drawings

function createMotionStimulus() {
	let stim = new PIXI.Container();

	stim.type = 'rdm'; // random dot motion
	// random dot motion has parameters:
	// x
	// y 
	// sd
	// contrast
	// coherence
	// theta

	// parameter window
	stim.moved = false // for tracking when to open the window
	stim.contrast = 1;
	stim.coherence = 1;
	stim.theta = 0;
	stim.paramWindow = createMotionParams(stim);
	stim.paramWindow.visible = false;
	stim.radius = 25;

	// setup stim interaction
	stim.interactive = true;
	stim
		.on('click',stimClick)
		.on('pointerdown', stimDown)
		.on('pointermove', stimMove)
		.on('pointerup', stimUp)
		.on('pointerupoutside', stimUp);

	ui_stim_container.addChild(stim);

	// add the getter functions (for computeSensitivity and computePartialSensitivity)

	// funcs will track what actually can be calculated for this stimulus
	stim.funcs = ['size','con','coh','theta'];

	// actual functions:
	stim.getSize = function() {
		let x = this.position.x+this.radius,
			y = this.position.y+this.radius;

		let degx = x/swidth*50-25,
			degy = y/sheight*50-25;

		// we return both the position and radius so that we can do overlap calculations
		return {pos: new PIXI.Point(degx,degy), rad:this.radius};
	}

	stim.getContrast = function() {
		return stim.contrast;
	}

	stim.getCoherence = function() {
		return stim.coherence;
	}

	stim.getTheta = function() {
		return stim.theta;
	}

	// create the mask
	stim.circmask = new PIXI.Graphics();
	stim.circmask.beginFill(0xFFFFFF,1);
	stim.circmask.drawCircle(stim.radius,stim.radius,stim.radius);
	stim.addChild(stim.circmask);
	stim.mask = stim.circmask;

	stim.g = new PIXI.Graphics();
	stim.addChild(stim.g);

	stim.dots = initDots(Math.PI*stim.radius**2/80,stim.radius*2,stim.radius*2,1,1,stim.theta,app.renderer.width/15,2);
	stim.position.set(150,150); // the true center is position+25/25

	return stim;
}


// Create the parameter window for the motion stimulus
// - this can be toggled on/off, but allows us to edit
// the properties of the stimulus, e.g. contrast/coherence etc
function createMotionParams(stim) {
	let param_window = new PIXI.Container();
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

  var style = new PIXI.TextStyle({fill:'#000000',fontSize:10});

	// Add theta/con/coh text
  var t = new PIXI.Text('Rotation',style);
  t.position.set(75,0);
  param_window.addChild(t);
  var t = new PIXI.Text('Contrast',style);
  t.position.set(75,50);
  param_window.addChild(t);
  var t = new PIXI.Text('Coherence',style);
  t.position.set(75,100);
  param_window.addChild(t);

  // Add the scrollbars


	return param_window;
}

function destroyMotionStimulus(idx) {
	// pass: this isn't functional yet
}

function drawMotionStimulus(idx) {
	stimulus[idx].dots = updateDots(stimulus[idx].dots,stimulus[idx].coherence,stimulus[idx].contrast,stimulus[idx].theta);
	drawDots(stimulus[idx].dots,stimulus[idx].g);
	setTimeout(function() {drawMotionStimulus(idx);},50);
}

//// stimulus interactivity controls

function stimClick(event) {
	if (!this.moved) {
		this.paramWindow.visible = !this.paramWindow.visible;
	}
}

function stimDown(event) {
	this.moved = false;
	this.isdown = true;
  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  this.offX = pos.x - this.x;
  this.offY = pos.y - this.y;
}

function stimUp(event) {
	this.dots.isdown = false;
  this.isdown = false;
}

function stimMove(event) {

  if (this.isdown) {
		this.dots.isdown = true;
		this.moved = true;
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = Math.min(swidth-this.radius*2,Math.max(0,pos.x-this.offX)),
  		ny = Math.min(sheight-this.radius*2,Math.max(0,pos.y-this.offY));
    this.position.set(nx,ny);

    // compute the percentage scrolled and use that to light up the menu
  }
}

//// parameter controls

function stimScroll(event) {
	if ((document.getElementById('help').style.display=='none') && (document.getElementById('opener').style.display=='none')) {
		event.preventDefault();
	}
	if (!ui_stim_container.visible) {
		brainScroll(event);
	} else {
		// Check if any parameter windows are open
	}
}

//// Sensitivity computation

let sensTest = true, tg;

function computeSensitivity() {
	// For each electrode compute the sensitivity to the current stimulus for all
	// x and y positions in the visual field. This speeds up computation 
	// when people move the stimuli around.
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
				tg.beginFill(0xFFFFFF,0.5);
				tg.drawCircle(einfo.x,einfo.y)
			}

			// Compute response to each stimulus
			let response = 0;
			for (let si = 0; si < stimulus.length; si++) {
				let stim = stimulus[si];
				// Get the stimulus type
				switch (stim.type) {
					case 'rdm':
						response += responseMotion(einfo,stim);
						break;
				}
			}
		}
	}
}

function computePartialSensitivity() {
	// For each electrode re-compute the sensitivity at the current parameters.
	// This is used when the parameters are being directly adjusted (e.g. size
	// contrast, coherence, etc)
}

function responseMotion(elec,stim) {

}

// The data code uses the function mappings to communicate which response function
// to use for contrast/coherence sensitivity. The parameters are stored by area.
const areas =  {
	0: {
		name: 'V1',
		contrast: {
			func: nakarushton,
			params: {slope:25,b0:0}
		},
		coherence: {
			func: insensitive,
			params: {max:1}
		}
	},
	1: {
		name: 'MT',
		contrast: {
			func: insensitive,
			params: {max:1}
		},
		coherence: {
			func: linear,
			params: {slope:10,b0:0}
		}
	}
};


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

	// let x = ,
		// y = ;
	return new PIXI.Point(x,y);
}

// RESPONSE FUNCTIONS
// funcs: {
// INSENSITIVE RESPONSE (if x>0, max response)
// max
function insensitive(x,params) {
	return arrayMap(x,
		function(x,params) {return x>0 ? params.max : 0;},
		params);
}
// LINEAR RESPONSE FUNCTION
// slope
// b0
function linear(x,params) {
	return arrayMap(x,
		function(x,params) {return params.b0 + x*params.slope;},
		params);
}
// NAKA RUSHTON RESPONSE FUNCTION
// rmax
// x50
function nakarushton(x,params) {
	return arrayMap(x,
		function(x,params) {
			let p = 0.3, q = 1.6;
			return params.rmax * ((Math.pow(x,p+q)) / (Math.pow(x,q)+Math.pow(params.x50,q)));
		},
		params);
}
// },
function arrayMap(array,func,params) {
	if (Array.isArray(array)) {
		out = [];
		for (let ai=0;ai<array.length;ai++) {
			out.push(func(array[ai],params));
		}
	} else {
		out = func(array,params);
	}
	return out;
}