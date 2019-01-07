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

	// Setup the stim screen and spikes
	uiStimInit(); // views.stim.container
	uiSpikeInit(); // views.spike.container

	uiBrainInit();
	uiElecInit();

	checkOpener();

	switchStatic();

  enableAudio(spk_init);

  if (audioCtx.state=='suspended') {
  	document.addEventListener('click',resumeAudio);
  	document.addEventListener('pointertap',resumeAudio);
  	console.log(audioCtx.state)
  }
}

function resumeAudio() {
	console.log('Resuming context')
	audioCtx.resume();
	document.removeEventListener('pointertap',resumeAudio);
	document.removeEventListener('click',resumeAudio);
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
	document.getElementById('help').style.display='block';
  document.getElementById("canvas").className = "blur";
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// VIEWS
// //////////////////////////// //////////////////////////// //////////////////////////// //

// The default locations for the four view containers are all 0,0 which makes it easy to reset them

function switchAny() {
	doub.brain.clicked = false;
	doub.view.clicked = false;
	views.stim.container.removeAllListeners();
	views.brain.container.removeAllListeners();
}

function switchStatic() {
	switchAny();

	// Scale down the stimulus window
	views.stim.stimulusWindow.scale.set(1);
	views.stim.container.x = views.stim.container.resetX, views.stim.container.y = views.stim.container.resetY;
	views.stim.container.visible = true;
	// Move the stimulus window up

	// Move the brain window down into the corner
	views.brain.container.scale.set(views.brain.staticScale);
	views.brain.container.x = views.buffer*2 + ORIGIN_W*0.5;
	views.brain.container.y = views.buffer;

	// Move the spike window
	views.spikes.container.x = views.spikes.container.resetX;
	views.spikes.container.y = views.spikes.container.resetY;
	views.spikes.container.visible = true;

	views.container.sortChildren();

	// Set the switchers
	views.brain.container.on('pointertap',function() {checkDouble('brain',resolveBrainSwitch)});
}

function switchBrain() {
	switchAny();
	
	views.brain.container.x = views.brain.container.resetX, views.brain.container.y = views.brain.container.resetY;
	views.brain.container.scale.set(1);

	// move the stimulus window to the top left corner
	views.stim.container.visible = false;

	// move the electrodes to the left side
	views.spikes.container.visible = false;
	
	views.container.sortChildren();
	views.brain.container.on('pointertap',function() {checkDouble('brain',resolveBrainSwitch)});
}

let isBrain = false;

function resolveBrainSwitch() {
	if (isBrain) {
		switchStatic();
		isBrain=false;
	} else {
		switchBrain();
		isBrain=true;
	}
}

let doub = {
	brain: {
		clicked: false,
		clickTick: -1
	},
	view: {
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
		doub[callby].clickTick = setTimeout(function() {doub[callby].clicked=false;},300);
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

	views.spikes.container.x = 4*views.buffer + ORIGIN_W * views.stim.STIM_W;
	views.spikes.container.y = views.buffer + ORIGIN_H - (ORIGIN_H*views.stim.ELEC_V);

	views.spikes.container.resetX = views.spikes.container.x;
	views.spikes.container.resetY = views.spikes.container.y;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE PICKER
// //////////////////////////// //////////////////////////// //////////////////////////// //

let electrodes;

function uiElecInit() {
	// Electrodes start in the top of the brain container. They can be dragged inside of this to different
	// positions. All four electrodes are visible by default, but they only "record" when they are in
	// a brain region that we have data for.	
	electrodes = [];

	// Create the four electrodes
	for (var ei=0;ei<4;ei++) {
		electrodes.push(new Electrode(ei));
	}
	spikeElectrodes();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //


// brain_container is the one that actually moves, the others just hold the images and set the zOrder
let iwidth = 1183, iheight = 880;

function uiBrainInit() {

	// original scale: (ORIGIN_W*0.5-views.buffer*2)/views.brain.container.initialWidth

	// Create the brain viewport
	views.brain.container = views.container.addChild(new DContainer());
	views.brain.container.interactive = true;
	// set to brain size
	views.brain.initialWidth = ORIGIN_W;
	views.brain.initialHeight = ORIGIN_H*views.brain.BRAIN_V;

	// figure out what the static view size will be. To do this you can take the
	// brain sprite dimensions and then figure out the min width/height which will put
	// you within the BRAIN_W/BRAIN_V sizes. 
	let max_brain_w = views.static.BRAIN_W*ORIGIN_W,
		max_brain_v = views.static.BRAIN_V*ORIGIN_H;

	let brain_ratio = max_brain_v/max_brain_w;
	let image_ratio = iheight/iwidth;

	if (brain_ratio<image_ratio) {
		// if the brain ratio is smaller that means the area available is wider
		// so set the scale according to the height
		views.brain.staticScale = max_brain_v/views.brain.initialHeight;
	} else {
		views.brain.staticScale = max_brain_w/views.brain.initialWidth;
	}

	let offset = 0.5*(ORIGIN_H-views.brain.initialHeight);

	views.brain.container.x = views.buffer;
	views.brain.container.y = views.buffer;

	views.brain.container.resetX = views.brain.container.x;
	views.brain.container.resetY = views.brain.container.y;

	// Add a frame in front of the brains
	views.brain.brainFrame = views.brain.container.addChild(new DContainer());
	views.brain.brainFrame.zOrder = 11;

	let g = views.brain.brainFrame.addChild(new PIXI.Graphics);

	// g.beginFill(0x000000,0);
	let lw = 5;
	g.lineStyle(lw,0x000000,1);
	g.drawRect(0,0,views.brain.initialWidth,views.brain.initialHeight);

	let brainBackground = views.brain.container.addChild(new DContainer());
	brainBackground.zOrder = 1;

	let g3 = brainBackground.addChild(new PIXI.Graphics);
	g.beginFill(0xFFFFFF,1);
	g.drawRect(0,0,views.brain.initialWidth,views.brain.initialHeight);

	let brainViewport = views.brain.container.addChild(new DContainer());
	brainViewport.zOrder = 12;
	let mask = brainViewport.addChild(new PIXI.Graphics);

	mask.beginFill(0xFFFFFF,1,0);
	mask.drawRect(lw/2,lw/2,views.brain.initialWidth-lw/2,views.brain.initialHeight-lw/2);
	// Set a mask which is the size of the original viewer
	brainViewport.mask = mask;

	// Create the actual brain container
	let brainContainer = brainViewport.addChild(new DContainer());

	// let g2 = brainContainer.addChild(new PIXI.Graphics);
	// // draw a red square
	// g2.beginFill(0xFF0000,1);
	// g2.drawRect(300,300,100,100);

	// track containers
	views.brain.viewport = brainBackground;
	views.brain.brainContainer = brainContainer;

	// add the scroll watcher
	// window.addEventListener('mousewheel',stimScroll,false);

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
		let aimgs = si==0 ? ['lateral','medial'] : ['medial_flip','lateral_flip'];
		let ascale = si==0 ? [1,1] : [1,1];

		for (let ii=0;ii<imgs.length;ii++) {
		  itype = imgs[ii];
		  atype = aimgs[ii];

		  // add the lateral brain image
			let img = views.brain.brainContainer_brains.addChild(PIXI.Sprite.fromImage('./assets/brain_'+itype+'.png'));
			img.alpha = 0.9;
			img.anchor.set(0,0);
			img.x = ii*iwidth+iwidth*si;
			img.y = si*iheight;
			img.scale.x = scale;

			ui_brains[side][itype] = img;

			// // add the low-alpha image in front
			let aimg = views.brain.brainContainer_areas.addChild(PIXI.Sprite.fromImage('./assets/areas_'+atype+'.png'));
			aimg.anchor.set(0,0);
			// the area image goes at different locations
			if (si==1) {
				aimg.x = ii*iwidth*si;
				aimg.y = si*iheight;
				aimg.scale.x = ascale[ii];
			} else {
				aimg.x = ii*iwidth+iwidth*si;
				aimg.y = si*iheight;
				aimg.scale.x = ascale[ii];
			}
			// aimg.alpha = 0.5;
			// views.brain.areas.push(aimg);
		}
	}

	// Add the zoom sprite
	views.brain.zoom = views.brain.container.addChild(PIXI.Sprite.fromImage('./assets/mag_glass.png'));
	views.brain.zoom.x = views.buffer;
	views.brain.zoom.y = views.buffer;
	views.brain.zoom.scale.set(ORIGIN_W*.1/views.brain.zoom.width);
	views.brain.zoom.interactive = true;
	views.brain.zoom
		// .on('click',resolveBrainSwitch);
		.on('pointertap',resolveBrainSwitch);

	brainContainer.sortChildren();

	// set the scale so that the brains are entirely visible in the viewport (use the mask width/height)
	let wScale = views.brain.initialWidth/(iwidth*2),
		hScale = views.brain.initialHeight/(iheight*2);
	let brainScale = Math.min(wScale,hScale);
	brainContainer.scale.set(brainScale);
	views.brain.initialScale = brainScale;
	// shift x/y location 
	if (wScale < hScale) {
		brainContainer.y = (views.brain.initialHeight-brainContainer.height)/2;
	} else {
		brainContainer.x = (views.brain.initialWidth-brainContainer.width)/2;
	}

	views.brain.container.initialWidth = views.brain.container.width;
	views.brain.container.sortChildren();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN MOVEMENT
// //////////////////////////// //////////////////////////// //////////////////////////// //

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