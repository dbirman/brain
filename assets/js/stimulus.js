/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = [], stimulus_graphic, swidth, sheight;

function initStimulus() {

	let x = 10, y = MENU_SCALEV*app.renderer.height+20+0.2*BRAIN_SCALEV*app.renderer.height;
	
	swidth=VIS_SCALEH*app.renderer.width, sheight=0.6*BRAIN_SCALEV*app.renderer.height-30;

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

  if (any(equals([77],e.keyCode))) {e.preventDefault();}

  if (e.keyCode==77) {
  	stimulus.push(createMotionStimulus());
  	drawMotionStimulus(stimulus.length-1);
  }
}

//// stimulus drawings

function createMotionStimulus() {
	let stim = new PIXI.Container();

	// parameter window
	stim.moved = false // for tracking when to open the window
	stim.contrast = 1;
	stim.coherence = 1;
	stim.paramWindow = createMotionParams();

	// setup stim interaction
	stim.interactive = true;
	stim
		.on('click',stimClick)
		.on('pointerdown', stimDown)
		.on('pointermove', stimMove)
		.on('pointerup', stimUp)
		.on('pointerupoutside', stimUp);

	ui_stim_container.addChild(stim);

	stim.g = new PIXI.Graphics();
	stim.addChild(stim.g);

	stim.dots = initDots(25,50,50,1,1,0,app.renderer.width/20,2);
	stim.position.set(150,150);

	return stim;
}

// Create the parameter window for the motion stimulus
// - this can be toggled on/off, but allows us to edit
// the properties of the stimulus, e.g. contrast/coherence etc
function createMotionParams() {
	let param_window = new PIXI.Container();

}

function destroyMotionStimulus(idx) {

}

function drawMotionStimulus(idx) {
	stimulus[idx].dots = updateDots(stimulus[idx].dots,stimulus[idx].coherence,stimulus[idx].contrast,0);
	drawDots(stimulus[idx].dots,stimulus[idx].g);
	setTimeout(function() {drawMotionStimulus(idx);},50);
}

//// stimulus interactivity controls

function stimClick(event) {
	if (!this.moved) {
		console.log('click');
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
  	let nx = Math.min(swidth,Math.max(0,pos.x-this.offX)),
  		ny = Math.min(sheight,Math.max(0,pos.y-this.offY));
    this.position.set(nx,ny);

    // compute the percentage scrolled and use that to light up the menu
  }
}

//// parameter controls

function stimScroll(event) {
	if (!ui_stim_container.visible) {return;}
	console.log(event.wheelDelta);
	console.log(event);
	if (document.getElementById('opener').style.display=='none') {
		event.preventDefault();
	}
}

//// Sensitivity computation

function computeSensitivity() {
	// For each electrode compute the sensitivity to the current stimulus for all
	// x and y positions in the visual field. This speeds up computation 
	// when people move the stimuli around.
}

function computePartialSensitivity() {
	// For each electrode re-compute the sensitivity at the current parameters.
	// This is used when the parameters are being directly adjusted (e.g. size
	// contrast, coherence, etc)
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