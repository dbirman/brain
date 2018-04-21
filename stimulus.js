/*
	Stimulus code

	The stimulus code tracks the stimuli that have been generated, renders them on 
	the screen, and deals with calculating the overlap and spike rates for the electrode
	code. This is the main client-side code. 
*/
let stimulus = []; 

function initStimulus(container) {

	let x = 10, y = MENU_SCALEV*app.renderer.height+20,
		swidth=VIS_SCALEH*app.renderer.width, sheight=BRAIN_SCALEV*app.renderer.height-30;

	container.position.set(x,y);

	// Draw the stimulus stage -- a large box on the left (visual field) and then 
	// a box on the right for the stimulus buttons
	// and a third box for the parameters

	// Because the stimulus region has its own graphics objects for each of tehse we'll draw
	// them all at once
	g = new PIXI.Graphics();

	g.lineStyle(1,0x000000,1);
	g.beginFill(0x808080,1);
	g.drawRect(0,0,swidth,sheight);

	g.moveTo()

	container.addChild(g);
}

//// stimulus drawings

// function 

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
	// For each electrode compute the sensitivity to the current stimulus 
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