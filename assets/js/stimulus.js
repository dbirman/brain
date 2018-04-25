/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight, deg2pix, pix2deg;

function initStimulus() {
	swidth=VIS_SCALEH*app.renderer.width, sheight=0.9*BRAIN_SCALEV*app.renderer.height-30;
	swidth = Math.min(swidth,sheight);
	sheight = swidth;

	deg2pix = sheight/51;
	pix2deg = 51/sheight;

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
  if (any(equals([69,68,81,65,87,83,72,77],e.keyCode))) {e.preventDefault();}

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

  // PARAM WINDOW STUFF
  for (let si=0;si<stimulus.length;si++) {
  	if (stimulus[si].paramWindow.visible) {
		  switch (e.keyCode) {
		  	case 81:
		  		stimulus[si].setTheta(stimulus[si].getTheta()+Math.PI/4);
		  		break;
		  	case 65:
		  		stimulus[si].setTheta(stimulus[si].getTheta()-Math.PI/4);
		  		break;
		  	case 87:
		  		stimulus[si].setContrast(stimulus[si].getContrast()+0.1);
		  		break;
		  	case 83:
		  		stimulus[si].setContrast(stimulus[si].getContrast()-0.1);
		  		break;
		  	case 69:
		  		stimulus[si].setCoherence(stimulus[si].getCoherence()+0.1);
		  		break;
		  	case 68:
		  		stimulus[si].setCoherence(stimulus[si].getCoherence()-0.1);
		  		break;
		  }
		  updateMotionParams(stimulus[si],stimulus[si].paramWindow.visible);
		  computePartialSensitivity();
  	}
  }
}

//// stimulus drawings

function createMotionStimulus() {

	let stim = new PIXI.Container();
	// add the getter functions (for computeSensitivity and computePartialSensitivity)
	stim.getSize = function() {
		let x = this.position.x+this.radius,
			y = this.position.y+this.radius;

		let degx = x/swidth*50-25,
			degy = -y/sheight*50+25;

		// we return both the position and radius so that we can do overlap calculations
		return {pos: new PIXI.Point(degx,degy), rad:this.radius*pix2deg};
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

	// add the setter functions
	stim.setSize = function(nrad) {
		stim.radius = nrad;
	}

	stim.setTheta = function(ntheta) {
		stim.theta = (Math.PI*2 + ntheta) % (Math.PI*2);
	}

	stim.setContrast = function(ncon) {
		stim.contrast = Math.max(0,Math.min(1,ncon));
	}

	stim.setCoherence = function(ncoh) {
		stim.coherence = Math.max(0,Math.min(1,ncoh));
	}

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
	updateMotionParams(stim,false);
	stim.radius = 50;

	// setup stim interaction
	stim.interactive = true;
	stim
		.on('click',stimClick)
		.on('pointerdown', stimDown)
		.on('pointermove', stimMove)
		.on('pointerup', stimUp)
		.on('pointerupoutside', stimUp);

	ui_stim_container.addChild(stim);


	// create the mask
	stim.circmask = new PIXI.Graphics();
	stim.circmask.beginFill(0xFFFFFF,1);
	stim.circmask.drawCircle(stim.radius,stim.radius,stim.radius);
	stim.addChild(stim.circmask);

	stim.g = new PIXI.Graphics();
	stim.g.mask = stim.circmask;
	stim.addChild(stim.g);

	stim.dots = initDots(Math.PI*stim.radius**2/80,stim.radius*2,stim.radius*2,1,1,stim.theta,app.renderer.width/15,2);
	stim.position.set(150,150); // the true center is position+25/25

	return stim;
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
    computePartialSensitivity();
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
		console.log('todo: add parameter scrolling')
	}
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

				tg.beginFill(0xFFFFFF,0.5);
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
