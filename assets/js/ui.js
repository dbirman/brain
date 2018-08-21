// Log of interaction events:

// click
// mousedown
// mousemove
// mouseout
// mouseover
// mouseup
// mouseupoutside
// pointercancel
// pointerdown
// pointermove
// pointerout
// pointerover
// pointertap
// pointerup
// pointerupoutside
// rightclick
// rightdown
// rightup
// rightupoutside
// tap
// touchcancel
// touchend
// touchendoutside
// touchmove
// touchstart


function uiInit() {
	// add a top-level DContainer()
	views.container = app.stage.addChild(new DContainer());

	initHelp();

	// Setup the static UI 
	uiStaticInit(); // views.static.container

	// Setup the stim screen and spikes
	uiStimInit(); // views.stim.container
	uiSpikeInit(); // views.spike.container

	uiBrainInit();
	uiElecInit();

	checkOpener();

	switchStatic();
}

function checkOpener() {
	try {
		if (localStorage.opener==undefined) {
			showOpener();
		}
	} catch (e) {
		if (sessionStorage.opener==undefined) {
			showOpener();
		}
	}
}

function showOpener() {
	try {
		localStorage.opener = true;
	} catch (e) {
		console.log('Local storage was blocked -- defaulting to session');
		sessionStorage.opener = true;
	}
	document.getElementById('opener').style.display='block';
  document.getElementById("canvas").className = "blur";
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// VIEWS
// //////////////////////////// //////////////////////////// //////////////////////////// //

// The default locations for the four view containers are all 0,0 which makes it easy to reset them

function switchAny() {
	doub.brain.clicked = false;
	doub.view.clicked = false;
	doub.static.clicked = false;
	views.static.container.removeAllListeners();
	views.stim.container.removeAllListeners();
	views.brain.container.removeAllListeners();
}

function switchStatic() {
	switchAny();

	// Reset the static view
	views.static.container.x = views.static.container.resetX, views.static.container.y = views.static.container.resetY;
	views.static.container.scale.set(1);

	// Scale down the stimulus window
	views.stim.stimulusWindow.scale.set(0.5);
	views.stim.container.x = views.stim.container.resetX, views.stim.container.y = views.stim.container.resetY;
	// Move the stimulus window up

	// Move the brain window down into the corner
	views.brain.container.scale.set(ORIGIN_W*(1-views.static.STIM_W-views.static.ELEC_W)/views.brain.container.initialWidth);
	views.brain.container.x = views.buffer + ORIGIN_W*(views.static.STIM_W+views.static.ELEC_W);
	views.brain.container.y = views.buffer + ORIGIN_H*views.static.STIM_V;

	// Move the spike window
	views.spikes.container.scale.set(0.95*ORIGIN_W*views.static.ELEC_W/(ORIGIN_W*(1-views.stim.STIM_W)));
	views.spikes.container.x = views.buffer + ORIGIN_W*views.static.STIM_W;
	views.spikes.container.y = views.buffer + ORIGIN_H*views.static.STIM_V;

	views.container.sortChildren();

	// Set the switchers
	views.brain.container.on('pointertap',function() {checkDouble('brain',switchBrain)});
	views.stim.container.on('pointertap',function() {checkDouble('view',switchStim)});
}

function switchStim() {
	switchAny();
	
	views.stim.container.x = views.stim.container.resetX, views.stim.container.y = views.stim.container.resetY;
	views.stim.container.scale.set(1);

	views.spikes.container.x = views.spikes.container.resetX, views.spikes.container.y = views.spikes.container.resetY;
	views.spikes.container.scale.set(1);
	views.spikes.container.zOrder = 1;

	// Reset the stimulus viewport
	views.stim.stimulusWindow.scale.set(1);

	// move the brain up into the top corner
	views.brain.container.scale.set((ORIGIN_H*(1-views.stim.ELEC_V))/(views.brain.initialWidth));
	views.brain.container.x = views.buffer + ORIGIN_W*(views.stim.STIM_W) + ORIGIN_W*0.5*(1-views.stim.STIM_W);
	views.brain.container.y = views.buffer;
	views.brain.container.zOrder = -1;

	// move the static brain up
	views.static.container.scale.set(0.4);
	views.static.container.x = views.buffer + ORIGIN_W*(views.stim.STIM_W);
	views.static.container.y = views.buffer;

	views.container.sortChildren();
	
	// Set the switchers
	views.brain.container.on('pointertap',function() {checkDouble('brain',switchBrain)});
	views.static.container.on('pointertap',function() {checkDouble('static',switchStatic)});
}

function switchBrain() {
	switchAny();
	
	views.brain.container.x = views.brain.container.resetX, views.brain.container.y = views.brain.container.resetY;
	views.brain.container.scale.set(1);

	// move the stimulus window to the top left corner
	views.stim.container.x = views.buffer; views.stim.container.y = views.buffer -ORIGIN_H/2.5;
	views.stim.stimulusWindow.scale.set(0.4);

	// move the electrodes to the left side
	views.spikes.container.x = views.buffer;
	views.spikes.container.y = views.buffer + ORIGIN_H * views.brain.STIM_V;

	// move the static brain up
	views.static.container.scale.set(0.3);
	views.static.container.x = views.buffer + ORIGIN_W*(views.brain.STIM_W) - ORIGIN_W*0.075;
	views.static.container.y = views.buffer;

	views.container.sortChildren();
	views.stim.container.on('pointertap',function() {checkDouble('view',switchStim)});
	views.static.container.on('pointertap',function() {checkDouble('static',switchStatic)});
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// STATIC VIEW
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiStaticInit() {
	// Set the background to the brain (no eyes yet...)
	views.static.container = views.container.addChild(new DContainer());
	views.static.container.interactive = true;

	views.static.container.x = ORIGIN_W*views.static.STIM_W;

	views.static.container.resetX = views.static.container.x;
	views.static.container.resetY = views.static.container.y;

	let sprite = views.static.container.addChild(new PIXI.Sprite.fromImage('./assets/brain_eyes.png'));
	let nsize_w = ORIGIN_W*views.static.BRAIN;
	let nsize_v = ORIGIN_H*views.static.STIM_V;

	sprite.anchor.set(0,0);
	sprite.scale.set(Math.min(nsize_w/sprite.width,nsize_v/sprite.height));
	sprite.initialScale = sprite.scale.x;
	sprite.initialPosition = new PIXI.Point(sprite.x,sprite.y);

	views.static.brainSprite = sprite;
}

let doub = {
	brain: {
		clicked: false,
		clickTick: -1
	},
	view: {
		clicked: false,
		clickTick: -1
	},
	static: {
		clicked: false,
		clickTick: -1
	}
};

function checkDouble(callby,callback) {
	if (doub[callby].clickTick!=undefined) {clearTimeout(doub[callby].clickTick);}
	if (doub[callby].clicked) {
		// this was a double tap
		doub[callby].clicked = false;
		callback();
	} else {
		doub[callby].clicked = true;
		doub[callby].clickTick = setTimeout(function() {doub[callby].clicked=false; console.log(doub[callby])},300);
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// STIMULUS WINDOW
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiStimInit() {
	// build the stimulus container
	initStimulus();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// SPIKE OUTPUT WINDOW
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiSpikeInit() {
	views.spikes.container = views.container.addChild(new DContainer());

	views.spikes.container.x  = 2 * views.buffer + ORIGIN_W * views.stim.STIM_W;
	views.spikes.container.y = views.buffer + ORIGIN_H * views.stim.STATIC_V;

	views.spikes.container.resetX = views.spikes.container.x;
	views.spikes.container.resetY = views.spikes.container.y;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE PICKER
// //////////////////////////// //////////////////////////// //////////////////////////// //


function uiElecInit() {
	// Electrodes start in the top of the brain container. They can be dragged inside of this to different
	// positions. All four electrodes are visible by default, but they only "record" when they are in
	// a brain region that we have data for.

	// Initialize container
	views.brain.elecContainer = views.brain.brainContainer.addChild(new DContainer());
	views.brain.elecContainer.zOrder = 4;
	views.brain.electrodes = [];

	// Create the four electrodes
	for (var ei=0;ei<1;ei++) {
		views.brain.electrodes.push(new Electrode(ei));
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE PICKER CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function elecClick(id,sprite) {
	if (electrodes[id]!=undefined) {
		electrodes[id].destroy();
		delete electrodes[id];
		sprite.tint = 0xFFFFFF;
	} else {
		console.log('creating new electrode with id: ' + id);
		electrodes[id] = new Electrode(id);
		electrodes[id].spike();
		sprite.tint = electrodes[id].color;
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //


// brain_container is the one that actually moves, the others just hold the images and set the zOrder
let iwidth = 1183, iheight = 880;

function uiBrainInit() {
	// Create the brain viewport
	views.brain.container = views.container.addChild(new DContainer());
	views.brain.container.interactive = true;
	// set to brain size
	views.brain.initialWidth = ORIGIN_W*(1-views.brain.STIM_W);
	views.brain.initialHeight = ORIGIN_H*(1-views.brain.STIM_V);

	let offset = 0.5*(ORIGIN_H-views.brain.initialHeight);

	views.brain.container.x = views.buffer + ORIGIN_W*views.brain.STIM_W;
	views.brain.container.y = offset+views.buffer;

	views.brain.container.resetX = views.brain.container.x;
	views.brain.container.resetY = views.brain.container.y;

	let brainViewport = views.brain.container.addChild(new DContainer());

	brainViewport.interactive = true;
	brainViewport
		.on('pointerdown', brainDown)
		.on('pointermove', brainMove)
		.on('pointerup', brainUp)
		.on('pointerupoutside', brainUp);

	let g = brainViewport.addChild(new PIXI.Graphics);

	g.beginFill(0xFFFFFF,1);
	g.lineStyle(1,0x000000,1);
	g.drawRect(0,0,views.brain.initialWidth,views.brain.initialHeight);


	let mask = brainViewport.addChild(new PIXI.Graphics);

	mask.beginFill(0xFFFFFF,1,0);
	mask.drawRect(0,0,views.brain.initialWidth,views.brain.initialHeight);

	// Create the actual brain viewport
	let brainContainer = brainViewport.addChild(new DContainer());
	brainContainer.zOrder = -1;

	// Set a mask which is the size of the original viewer
	brainViewport.mask = mask;

	let g2 = brainContainer.addChild(new PIXI.Graphics);
	// draw a red square
	g2.beginFill(0xFF0000,1);
	g2.drawRect(300,300,100,100);

	// track containers
	views.brain.viewport = brainViewport;
	views.brain.brainContainer = brainContainer;

	// add the scroll watcher
	window.addEventListener('mousewheel',stimScroll,false);

	// add the four brain images

	ui_brains = {};
	let sides = ['l','r'], sides_pos;

	views.brain.brainContainer_brains = views.brain.brainContainer.addChild(new DContainer());
	views.brain.brainContainer_brains.zOrder=-2;
	views.brain.brainContainer_areas = views.brain.brainContainer.addChild(new DContainer());
	views.brain.brainContainer_areas.zOrder=-1;
	views.brain.brainContainer_areas.alpha = 0.5;

	for (let si=0;si<sides.length;si++) {
		side = sides[si];
		ui_brains[side] = {};

		let scale = si==0 ? 1 : -1;

		let imgs = si==0 ? ['lateral','medial'] : ['medial','lateral'];

		for (let ii=0;ii<imgs.length;ii++) {
		  // add the lateral brain image
		  itype = imgs[ii];
			let img = views.brain.brainContainer_brains.addChild(PIXI.Sprite.fromImage('./assets/brain_'+itype+'.png'));
			img.anchor.set(0,0);
			img.x = ii*iwidth+iwidth*si;
			img.y = si*iheight;
			img.scale.x = scale;

			ui_brains[side][itype] = img;

			// // add the low-alpha image in front
			let aimg = views.brain.brainContainer_areas.addChild(PIXI.Sprite.fromImage('./assets/areas_'+itype+'.png'));
			aimg.anchor.set(0,0);
			aimg.x = ii*iwidth+iwidth*si;
			aimg.y = si*iheight;
			aimg.scale.x = scale;
			// aimg.alpha = 0.5;
			// views.brain.areas.push(aimg);
		}
	}

	brainContainer.sortChildren();

	// set the scale so that the brains are entirely visible in the viewport (use the mask width/height)
	let wScale = mask.width/(iwidth*2),
		hScale = mask.height/(iheight*2);
	let brainScale = Math.min(wScale);
	brainContainer.scale.set(brainScale);
	views.brain.initialScale = brainScale;
	// shift x/y location 
	if (wScale < hScale) {
		brainContainer.y = (mask.height-brainContainer.height)/2;
	} else {
		brainContainer.x = (mask.width-brainContainer.width)/2;
	}

	views.brain.container.initialWidth = views.brain.container.width;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN MOVEMENT
// //////////////////////////// //////////////////////////// //////////////////////////// //

function windowDown(event) {
	console.log(event.target);


}
function brainDown(event) {
	if (electrodeMoving) {return;}

	this.isdown = true;
  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  views.brain.brainContainer.offX = pos.x - views.brain.brainContainer.x;
  views.brain.brainContainer.offY = pos.y - views.brain.brainContainer.y;
}

function brainUp(event) {
	if (electrodeMoving) {return;}

  this.isdown = false;
}

function brainMove(event) {
  if (electrodeMoving) {return;}

  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = checkBrainX(pos.x-views.brain.brainContainer.offX);
  	let ny = checkBrainY(pos.y-views.brain.brainContainer.offY);
    views.brain.brainContainer.position.set(nx,ny);
  }
}

function checkBrainX(nx) {
	return Math.max(-iwidth*views.brain.brainContainer.scale.x,Math.min(views.brain.initialWidth-iwidth*views.brain.brainContainer.scale.x,nx));
}

function checkBrainY(ny) {
	return Math.max(-iheight*views.brain.brainContainer.scale.y,Math.min(views.brain.initialHeight-iheight*views.brain.brainContainer.scale.y,ny));
}

// --- Scrolling functionality 

function stimScroll(event) {
	if ((document.getElementById('help').style.display=='none') && (document.getElementById('opener').style.display=='none')) {
		event.preventDefault();
	}

	if (event.ctrlKey) {
		let scale = views.brain.brainContainer.scale.x;
		//pivot to the location
		let x = event.x, y = event.y;
		let p = views.brain.brainContainer.toLocal(new PIXI.Point(x,y));
		// scale p by the current scale
		// let px = views.brain.brainContainer.position.x,
		// 	py = views.brain.brainContainer.position.y;
		// views.brain.brainContainer.position.set(0,0);
		// views.brain.brainContainer.pivot.set(p.x,p.y);
		// scale
		let nscale = Math.max(views.brain.initialScale/2,Math.min(views.brain.initialScale*4,scale-event.deltaY*0.01));
		views.brain.brainContainer.scale.set(nscale);	
		let cx = views.brain.brainContainer.x,
			cy = views.brain.brainContainer.y;
		// we need to adjust the positino based on px and py and the change in scale
		let dscale = nscale-scale;
		views.brain.brainContainer.position.set(checkBrainX(cx-dscale*p.x),checkBrainY(cy-dscale*p.y));

		// de-pivot
		// views.brain.brainContainer.pivot.set(0,0);
		// views.brain.brainContainer.position(set,px,py);
		// views.brain.brainContainer.position.set(views.brain.brainContainer.position.x+p.x,views.brain.brainContainer.position.y+p.y);
  } else {
		// console.log(event.wheelDeltaZ);
		if (views.brain.container.visible) {
			brainScroll(event);
		} else {
			// Check if any parameter windows are open
			// console.log('todo: add parameter scrolling')
		}
  }
}

function brainScroll(event) {
	let nx = checkBrainX(views.brain.brainContainer.x-event.deltaX);
	let ny = checkBrainY(views.brain.brainContainer.y-event.deltaY);
  views.brain.brainContainer.position.set(nx,ny); 
}