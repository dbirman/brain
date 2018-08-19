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

	checkOpener();

	// // uiElecInit();
	// uiSpikeInit();
	// uiStimInit();

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
}

function initStim() {
	views.stim.container = newViewContainer();
	views.stim.switchCallback = switchStim;
	uiStimInit();
}

function switchStim() {
	// Move the stimulus viewport to this container and de-warp it
	views.stim.container.addChild(views.stim.stimulusWindow);
	views.stim.stimulusWindow.scale.set(1);
}

function initBrain() {
	views.brain.container = newViewContainer();
	views.brain.switchCallback = switchBrain;
	uiBrainInit();
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
	let sprite = new PIXI.Sprite.fromImage('./assets/brain_lateral.png');
	let nsize = ORIGIN_WIDTH*0.8*(1-views.static.VISUAL_FIELD);
	let size = sprite.width;
	sprite.anchor.set(1,0);
	sprite.x = ORIGIN_WIDTH;
	sprite.y = 0;
	sprite.scale.set(nsize/size);

	// add event handler to switch views
	sprite.interactive = true;
	sprite.on('pointertap',function() {checkDouble(this,getSwitchView('brain'));});

	views.static.container.addChild(sprite);
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
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// SPIKE OUTPUT WINDOW
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_spike_container;

function uiSpikeInit() {
	ui_spike_container = new DContainer();
	ui_spike_container.visible = false;

	ui_container.addChild(ui_spike_container);
	//
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE PICKER
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_elec_container;

function uiElecInit() {
	var width = app.renderer.width, height = app.renderer.height;

	var ecsize = height * MBRAIN_SCALEV;

	// Initialize container
	ui_elec_container = new DContainer();
	ui_elec_container.x = 10;
	ui_elec_container.y = height - MBRAIN_SCALEV*height-10;
	ui_elec_container.zOrder = 4;

	ui_container.addChild(ui_elec_container);

	// Add a white background
	let g = new PIXI.Graphics();
	g.beginFill(0xFFFFFF,1);
	g.lineStyle(1,0x000000,1);
	g.drawRect(0,0,ecsize,MBRAIN_SCALEV*height);

	ui_elec_container.addChild(g);

	let p1 = ecsize/3-ecsize/20, p2 = ecsize*2/3+ecsize/20;
	// Add buttons to create new electrodes (4 maximum)
	let xs = [p1,p2,p1,p2], ys=[p1,p1,p2,p2];

	for (let ii=0;ii<xs.length;ii++) {
		let x = xs[ii], y = ys[ii];

		// Create a button, graphic + text, use gray -- we'll update the color when an electrode is created
		let bg = new PIXI.Graphics();
		bg.beginFill(0x808080,1);
		bg.lineStyle(1,0x000000,1);
		bg.drawCircle(x,y,ecsize/6,ecsize/6);

		// Add a little white electrode using the image
		let bs = new PIXI.Sprite.fromImage('./assets/electrode.png');
		bs.scale.set(ecsize/5/167);
		bs.anchor.set(0.5,0.5);
		bs.x = x, bs.y = y;

		bg.addChild(bs);

		bg.interactive = true;
		bg.on('click',function() {elecClick(ii,bs);});

		ui_elec_container.addChild(bg);
	}

	// Add text at the top

  var style = new PIXI.TextStyle({fill:'#000000',fontSize:ecsize/10});
  var t = new PIXI.Text('Electrodes',style);
  t.x = ecsize/2; t.y = ecsize/20;
  t.anchor.set(0.5,0.5);
  ui_elec_container.addChild(t);
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
// MENU BAR RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_menu_container, ui_menu_graphics_left, ui_menu_graphics_right;

function uiMenuInit() {
	// Create buttons and link to appropriate callbacks
	// add menu container
	ui_menu_container = new DContainer();
	ui_container.addChild(ui_menu_container);
	// set container properties
	ui_menu_container.zOrder = 99;
	ui_menu_container.position.set(10,10);

	redrawMenu(0xFFFFFF,0x808080);
}

function redrawMenu(lcolor,rcolor) {
	if (ui_menu_graphics_left!=undefined) {ui_menu_graphics_left.destroy();}
	if (ui_menu_graphics_right!=undefined) {ui_menu_graphics_right.destroy();}
	let lwidth = 160, rwidth = 275, menu_height = MENU_SCALEV*app.renderer.height;
	ui_menu_graphics_left = new PIXI.Graphics();

	ui_menu_graphics_left.beginFill(lcolor,1);
	ui_menu_graphics_left.lineStyle(1,0x000000,1);
	ui_menu_graphics_left.drawRect(0,0,lwidth,menu_height);
	ui_menu_graphics_left.endFill();

	ui_menu_graphics_right = new PIXI.Graphics();

	ui_menu_graphics_right.beginFill(rcolor,1);
	ui_menu_graphics_right.lineStyle(1,0x000000,1);
	ui_menu_graphics_right.drawRect(lwidth,0,rwidth,menu_height);
	ui_menu_graphics_right.endFill();

	// add text
  var style = new PIXI.TextStyle({fill:'#000000',fontSize:menu_height/1.5});
  var t = new PIXI.Text('Brain viewer',style);
  t.x = lwidth/2; t.y = 1;
  t.anchor.set(0.5,0);
  ui_menu_graphics_left.addChild(t);

  var t = new PIXI.Text('Stimulus and recorder',style);
  t.x = lwidth+rwidth/2; t.y = 1;
  t.anchor.set(0.5,0);
  ui_menu_graphics_right.addChild(t);

	// add interaction
	ui_menu_graphics_left.interactive = true;
	ui_menu_graphics_left.on('click',viewerSwitch)

	ui_menu_graphics_right.interactive = true;
	ui_menu_graphics_right.on('click',stimulusSwitch)


	// add both boxes
	ui_menu_container.addChild(ui_menu_graphics_left);
	ui_menu_container.addChild(ui_menu_graphics_right);
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MENU CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function viewerSwitch() {
	redrawMenu(0xFFFFFF,0x808080);
	ui_brain_container.visible = true;
	ui_stim_container.visible = false;
	ui_spike_container.visible = false;
	ui_mini_overlay_container.visible=true;
	updateElectrodes('silence');
}

function stimulusSwitch() {
	ui_brain_container.visible = false;
	ui_stim_container.visible = true;
	ui_spike_container.visible = true;
	ui_mini_overlay_container.visible=false;
	updateElectrodes('spike');
	updateElectrodes('wake');
	redrawMenu(0x808080,0xFFFFFF);
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //


// brain_container is the one that actually moves, the others just hold the images and set the zOrder
let brainViewport;

function uiBrainInit() {
	// Create the brain viewport

	// create viewport
	let brainViewport = views.brain.container.addChild(new DContainer());

	let offset = 0.5*(1-views.brain.BRAIN_H)*ORIGIN_HEIGHT;
	brainViewport.x = ORIGIN_WIDTH-offset-views.brain.BRAIN_W*ORIGIN_WIDTH;
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
	g.drawRect(0,0,views.brain.BRAIN_W*ORIGIN_WIDTH,views.brain.BRAIN_H*ORIGIN_HEIGHT);

	let mask = brainViewport.addChild(new PIXI.Graphics);

	mask.beginFill(0xFFFFFF,1,0);
	mask.drawRect(0,0,views.brain.BRAIN_W*ORIGIN_WIDTH,views.brain.BRAIN_H*ORIGIN_HEIGHT);

	// Create the actual brain viewport
	let brainContainer = brainViewport.addChild(new DContainer());
	brainContainer.zOrder = -1;

	// Set a mask which is the size of the original viewer
	brainContainer.mask = mask;

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
	let iwidth = 1183, iheight = 880;

	for (let si=0;si<sides.length;si++) {
		side = sides[si];
		ui_brains[side] = {};

		let scale = si==0 ? 1 : -1;

		let imgs = si==0 ? ['lateral','medial'] : ['medial','lateral'];

		for (let ii=0;ii<imgs.length;ii++) {
		  // add the lateral brain image
		  itype = imgs[ii];
			let img = brainContainer.addChild(PIXI.Sprite.fromImage('./assets/brain_'+itype+'.png'));
			img.anchor.set(0,0);
			img.x = ii*iwidth+iwidth*si;
			img.y = si*iheight;
			img.scale.x = scale;

			ui_brains[side][itype] = img;

			// // add the invisible area image in front
			// let aimg = PIXI.Sprite.fromImage('./assets/areas_'+itype+'.png');
			// aimg.anchor.set(0,0);
			// aimg.x = ii*iwidth+offset+iwidth*si;
			// aimg.y = 0;
			// aimg.scale.x = scale;

			// brainContainer.addChild(aimg);
		}
	}

	// set the scale so that the brains are entirely visible in the viewport (use the mask width/height)
	let wScale = mask.width/(iwidth*2),
		hScale = mask.height/(iheight*2);
	let brainScale = Math.min(wScale,);
	brainContainer.scale.set(brainScale);

	console.log(wScale)
	console.log(hScale)
	console.log(brainContainer.height);
	// shift x/y location 
	if (wScale < hScale) {
		brainContainer.y = (mask.height-brainContainer.height)/2;
	} else {
		brainContainer.x = (mask.width-brainContainer.width)/2;
	}

	// ui_brain_container.scale.set(bscale);
	// ui_brain_container.position.x = brain_ioffset;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN MOVEMENT
// //////////////////////////// //////////////////////////// //////////////////////////// //

function windowDown(event) {
	console.log(event.target);


}
function brainDown(event) {
	if (electrodeMoving) {return;}

	views.brain.evCache.push(event);
	console.log(views.brain.evCache);

	this.isdown = true;
  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  views.brain.brainContainer.offX = pos.x - views.brain.brainContainer.x;
  views.brain.brainContainer.offY = pos.y - views.brain.brainContainer.y;
}

function brainUp(event) {
	console.log('brainup');
	if (electrodeMoving) {return;}

	// Remove event from event cache
	for (var i=0;i<views.brain.evCache.length;i++) {
		if (views.brain.evCache[i].pointerId == event.pointerId) {
			views.brain.evCache.splice(i,1); break;
		}
	}

  this.isdown = false;
}

function brainMove(event) {
  if (electrodeMoving) {return;}

  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = checkBrainX(pos.x-views.brain.brainContainer.offX);
  	let ny = checkBrainY(pos.y-views.brain.brainContainer.offY);
  	console.log(nx)
  	console.log(ny)
    views.brain.brainContainer.position.set(nx,ny);
  }
}

function checkBrainX(nx) {
	return nx; //Math.max(brain_ioffset-bscale*1183*3,Math.min(brain_ioffset,nx));
}

function checkBrainY(ny) {
	return ny;
}

// --- Scrolling functionality 

function stimScroll(event) {
	if ((document.getElementById('help').style.display=='none') && (document.getElementById('opener').style.display=='none')) {
		event.preventDefault();
	}

	if (event.ctrlKey) {
		let scale = views.brain.brainContainer.scale.x;
		//pivot to the location
		console.log('zoom currently broken (always relative to 0,0)')
		let x = event.x, y = event.y;
		let p = views.brain.brainContainer.toLocal(new PIXI.Point(x,y));
		// scale p by the current scale
		// views.brain.brainContainer.pivot.set(p.x,p.y);
		// views.brain.brainContainer.position.set(views.brain.brainContainer.position.x-p.x,views.brain.brainContainer.position.y-p.y);
		// scale
		views.brain.brainContainer.scale.set(scale-event.deltaY*0.01);	
		// de-pivot
		// views.brain.brainContainer.pivot.set(0,0);
		// views.brain.brainContainer.position.set(views.brain.brainContainer.position.x+p.x,views.brain.brainContainer.position.y+p.y);
  } else {
		// console.log(event.wheelDeltaZ);
		if (views.brain.container.visible) {
			brainScroll(event);
		} else {
			// Check if any parameter windows are open
			console.log('todo: add parameter scrolling')
		}
  }
}

function brainScroll(event) {
	let nx = checkBrainX(views.brain.brainContainer.x-event.deltaX);
	let ny = checkBrainY(views.brain.brainContainer.y-event.deltaY);
  views.brain.brainContainer.position.set(nx,ny); 
}