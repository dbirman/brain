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
	initViews();

	initHelp();

	checkOpener();

	// console.log('temp code');
	// stimulusSwitch();
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

function initViews() {
	initStatic();
	initStim();
	initBrain();
	setView('static');
}

function initStatic() {
	views.static.container = newViewContainer();
	views.static.switchCallback = switchStatic;
	uiStaticInit();
}

function switchStatic() {
	// Move the stimulus viewport to this container and warp it
	views.static.container.addChild(views.stim.stimulusWindow);
	views.stim.stimulusWindow.scale.set(0.5);
	// need to set position to vertical center
	// views.stim.stimulusWindow.position.set()

	// Get the brain back
	views.static.container.addChild(views.static.brain);
	views.static.brain.scale.set(views.static.brain.initialScale);
	views.static.brain.position.set(views.static.brain.initialPosition.x,views.static.brain.initialPosition.y);
}

function initStim() {
	views.stim.container = newViewContainer();
	views.stim.switchCallback = switchStim;
	uiStimInit();
	uiSpikeInit();
}

function switchStim() {
	// Move the stimulus viewport to this container and de-warp it
	views.stim.container.addChild(views.stim.stimulusWindow);
	views.stim.stimulusWindow.scale.set(1);

	// Move the stim brain to this container and de-warp it
	views.stim.container.addChild(views.static.brain);
	views.static.brain.scale.set(views.static.brain.initialScale*0.5);
	views.static.brain.position.set(ORIGIN_WIDTH*views.stim.STIMULUS_W+10,0);
}

function initBrain() {
	views.brain.container = newViewContainer();
	views.brain.switchCallback = switchBrain;
	uiBrainInit();
	uiElecInit();
}

function switchBrain() {
	// pass
}

function getSwitchView(caller) {
	if (caller=='stim') {
		return cView=='stim' ? 'static' : 'stim';
	}
	if (caller=='brain') {
		return cView=='brain' ? 'static' : 'brain';
	}
}

let cView;

function setView(view) {
	let keys = Object.keys(views);
	for (let vi=0; vi<keys.length;vi++) {
		views[keys[vi]].container.visible = view==keys[vi];
		if (view==keys[vi]) {cView = keys[vi]; views[keys[vi]].switchCallback();}
	}
}

function newViewContainer() {
	let container = new DContainer();
	container.visible = false;
	app.stage.addChild(container);
	return container;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// STATIC VIEW
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiStaticInit() {
	// Set the background to the brain (no eyes yet...)
	let sprite = views.static.container.addChild(new PIXI.Sprite.fromImage('./assets/brain_lateral.png'));
	let nsize = ORIGIN_WIDTH*0.8*(1-views.static.VISUAL_FIELD);
	sprite.anchor.set(1,0);
	sprite.x = ORIGIN_WIDTH;
	sprite.y = 0;
	sprite.scale.set(nsize/iwidth);
	sprite.initialScale = sprite.scale.x;
	sprite.initialPosition = new PIXI.Point(sprite.x,sprite.y);

	// add event handler to switch views
	sprite.interactive = true;
	sprite.on('pointertap',function() {checkDouble(this,getSwitchView('brain'));});

	views.static.brain = sprite;
}

function checkDouble(caller,newView) {
	if (caller.clickTick!=undefined) {clearTimeout(caller.clickTick);}
	if (caller.clicked) {
		// this was a double tap
		setView(newView);
		caller.clicked = false;
	} else {
		caller.clicked = true;
		caller.clickTick = setTimeout(function() {caller.clicked=false;},500);
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// STIMULUS WINDOW
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiStimInit() {
	// build the stimulus container
	initStimulus();

	// put a little mini brain at the top -- which will flip us to the brain view
	let sprite = views.stim.container.addChild(new PIXI.Sprite.fromImage('./assets/brain_lateral.png'));
	let nsize = ORIGIN_WIDTH * (1-views.stim.STIMULUS-views.stim.ELECTRODES);
	sprite.x = ORIGIN_WIDTH * views.stim.STIMULUS + 10;
	sprite.scale.set(nsize/iwidth);

	sprite.interactive = true;
	sprite.on('pointertap',function() {checkDouble(this,'brain')});
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// SPIKE OUTPUT WINDOW
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiSpikeInit() {
	views.stim.spikeContainer = views.stim.container.addChild(new DContainer());
	//
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
let brainViewport,
	iwidth = 1183, iheight = 880;

function uiBrainInit() {
	// Create the brain viewport
	views.brain.initialWidth = views.brain.BRAIN_W*ORIGIN_WIDTH;
	views.brain.initialHeight = views.brain.BRAIN_H*ORIGIN_HEIGHT;

	// create viewport
	let brainViewport = views.brain.container.addChild(new DContainer());

	let offset = 0.5*(1-views.brain.BRAIN_H)*ORIGIN_HEIGHT;
	brainViewport.x = ORIGIN_WIDTH-offset-views.brain.initialWidth;
	brainViewport.y = offset;

	brainViewport.interactive = true;
	// brainViewport.pointer = 'grab';
	brainViewport
		.on('pointertap',function() {checkDouble(this,getSwitchView('brain'));})
		.on('pointerdown', brainDown)
		.on('pointermove', brainMove)
		.on('pointerup', brainUp)
		.on('pointerupoutside', brainUp);


	// For pinch and zoom events we need to track events
	views.brain.evCache = [],
		views.brain.evDiff = -1;

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
	let brainScale = Math.min(wScale,);
	brainContainer.scale.set(brainScale);
	views.brain.initialScale = brainScale;
	// shift x/y location 
	if (wScale < hScale) {
		brainContainer.y = (mask.height-brainContainer.height)/2;
	} else {
		brainContainer.x = (mask.width-brainContainer.width)/2;
	}
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