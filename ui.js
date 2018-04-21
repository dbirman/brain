let ui_container,
	iwidth = 1183, iheight = 880,
	bscale = BRAIN_SCALEV * app.renderer.height / iheight, // pixel size of the images
	brain_ioffset = (app.renderer.width - bscale*iwidth)/2;

function uiInit() {
	ui_container = new DContainer();
	app.stage.addChild(ui_container);

	document.getElementById('opener').style.display='none';
	uiMenuInit();
	uiElecInit();
	uiMiniInit();
	uiBrainInit();
	uiSpikeInit();
	uiStimInit();

	console.log('temp code');
	stimulusSwitch();

	ui_container.sortChildren();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// STIMULUS WINDOW
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_stim_container;

function uiStimInit() {
	var width = app.renderer.width, height = app.renderer.height;

	ui_stim_container = new DContainer();
	ui_stim_container.visible = false;
	ui_container.addChild(ui_stim_container);

	// build the stimulus container
	initStimulus(ui_stim_container);

	// add mouse wheel trackers
	window.addEventListener('mousewheel',stimScroll,false);
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
	console.log(ecsize);

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
	g.drawRect(-2.5,-2.5,ecsize,MBRAIN_SCALEV*height);

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
		let temp = new Electrode(id);
		sprite.tint = temp.color;
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
	console.log('Menu re-drawing');
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
}

function stimulusSwitch() {
	ui_brain_container.visible = false;
	ui_stim_container.visible = true;
	ui_spike_container.visible = true;
	redrawMenu(0x808080,0xFFFFFF);
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MINI BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_mini_container, ui_mini_overlay_container, ui_mini_brains_container, ui_mini_electrodes_container,
	mini_scale;

function uiMiniInit() {
	// Set width/height and get the scale of the mini box relative to the full brains
	var width = app.renderer.width, height = app.renderer.height;
	// The mini box is scaled relative to the vertical height. bscale stores the relative height compared
	// to the original images, so we can get the scale of the mini box from this:
	mini_scale = bscale * MBRAIN_SCALEV / BRAIN_SCALEV;

	ui_mini_container = new DContainer();
	ui_container.addChild(ui_mini_container);
	// make interactive and set zOrder
	ui_mini_container.zOrder = 1;
	ui_mini_container.interactive = true;
	ui_mini_container
		.on('pointerdown', miniDown)
		.on('pointermove', miniMove)
		.on('pointerup', miniUp)
		.on('pointerupoutside', miniUp);
	// move the mini_container to its position (up from bottom right)
	ui_mini_container.x = width - mini_scale *iwidth*4-10;
	ui_mini_container.y = height - MBRAIN_SCALEV*height-10;

	///////////////////////////////////////////////////

	// create the overlay container
	ui_mini_overlay_container = new DContainer();
	ui_mini_overlay_container.zOrder = 4;
	ui_mini_container.addChild(ui_mini_overlay_container);

	// create the window
	miniWindow = new PIXI.Graphics();
	miniWindow.beginFill(0x000000,0.25);
	miniWindow.drawRect(-2.5,-2.5,mini_scale *iwidth,MBRAIN_SCALEV*height);
	miniWindow.endFill();
	ui_mini_overlay_container.addChild(miniWindow);

	///////////////////////////////////////////////////
	
	// create the mini brains container
	ui_mini_brains_container = new DContainer();
	ui_mini_brains_container.zOrder = 2;
	ui_mini_container.addChild(ui_mini_brains_container);

	// add a white background for the brain container
	let backgroundGraphic = new PIXI.Graphics();
	backgroundGraphic.lineStyle(1,0x000000,1);
	backgroundGraphic.beginFill(0xFFFFFF,1);
	backgroundGraphic.drawRect(-5,-5,MBRAIN_SCALEV * app.renderer.height / iheight *iwidth*4+5,MBRAIN_SCALEV*height+5);
	backgroundGraphic.endFill();
	ui_mini_brains_container.addChild(backgroundGraphic);

	// add the brain images themselves

	let sides = ['l','r'], sides_pos;
	for (let si=0;si<sides.length;si++) {
		side = sides[si];

		offset = si*2*iwidth;
		let scale = si==0 ? 1 : -1;

		let imgs = si==0 ? ['lateral','medial'] : ['medial','lateral'];

		for (let ii=0;ii<imgs.length;ii++) {
		  // add the lateral brain image
		  itype = imgs[ii];
			let img = PIXI.Sprite.fromImage('./assets/brain_'+itype+'.png');
			img.alpha = 0.5;
			img.anchor.set(0,0);
			img.x = mini_scale*(ii*iwidth+offset+iwidth*si)-2.5;
			img.y = -2.5;
			img.scale.set(mini_scale*scale,Math.abs(mini_scale*scale));

			console.log('here')
			ui_mini_brains_container.addChild(img);
		}
	}

	///////////////////////////////////////////////////
	
	// create the electrodes container
	ui_mini_electrodes_container = new DContainer();
	ui_mini_electrodes_container.zOrder = 3;
	ui_mini_container.addChild(ui_mini_electrodes_container);

	ui_mini_container.sortChildren();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MINI CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function miniDown(event) {
	// console.log('Not implemented');
	// this.isdown = true;
 //  // calculate offset
 //  var pos = event.data.getLocalPosition(this.parent);
 //  this.offX = pos.x - this.x;
 //  this.offY = pos.y - this.y;
 //  ui_brains_container.alpha = 0.5;
 //  ui_areas_container.visible = true;
}
function miniUp() {
	// console.log('Not implemented');
  // this.isdown = false;
  // ui_brains_container.alpha = 1;
  // ui_areas_container.visible = false;
}

function miniMove(event) {
	// console.log('Not implemented');
  // if (this.isdown) {
  //   var pos = event.data.getLocalPosition(this.parent);
  // 	let nx = Math.max(-bscale*1183*2.935,Math.min(bscale*80,pos.x-this.offX)),
  // 		ny = pos.y-this.offY;
  // 	ny = 0;	
  //   this.position.set(nx,this.position.y);
  //   ui_mini_overlay_container.position.set(mini_scale/bscale*(-nx+bscale*80),ui_mini_overlay_container.position.y);

  //   // compute the percentage scrolled and use that to light up the menu
  // }
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //


// brain_container is the one that actually moves, the others just hold the images and set the zOrder
let ui_brain_container, ui_brains_container, ui_areas_container, ui_brains;

function uiBrainInit() {

	// create a container
	ui_brain_container = new DContainer();
	ui_container.addChild(ui_brain_container);
	// make the container interactive
	ui_brain_container.y = MENU_SCALEV*app.renderer.height;
	ui_brain_container.zOrder = 0;
	ui_brain_container.interactive = true;
	ui_brain_container.pointer = 'grab';
	ui_brain_container
		.on('pointerdown', brainDown)
		.on('pointermove', brainMove)
		.on('pointerup', brainUp)
		.on('pointerupoutside', brainUp);
	// center the brain container

	// create the brains container
	ui_brains_container = new DContainer();
	ui_brains_container.zOrder = -1;
	ui_brain_container.addChild(ui_brains_container);

	// create the areas container
	ui_areas_container = new DContainer();
	ui_areas_container.zOrder = 1;
  ui_areas_container.visible = false;
	ui_brain_container.addChild(ui_areas_container);

	ui_brains = {};
	let sides = ['l','r'], sides_pos;
	for (let si=0;si<sides.length;si++) {
		side = sides[si];
		ui_brains[side] = {};

		offset = si*2*iwidth;
		let scale = si==0 ? 1 : -1;

		let imgs = si==0 ? ['lateral','medial'] : ['medial','lateral'];

		for (let ii=0;ii<imgs.length;ii++) {
		  // add the lateral brain image
		  itype = imgs[ii];
			let img = PIXI.Sprite.fromImage('./assets/brain_'+itype+'.png');
			img.anchor.set(0,0);
			img.x = ii*iwidth+offset+iwidth*si;
			img.y = 0;
			img.scale.x = scale;

			ui_brains[side][itype] = img;

			ui_brains_container.addChild(ui_brains[side][itype]);

			// add the invisible area image in front
			let aimg = PIXI.Sprite.fromImage('./assets/areas_'+itype+'.png');
			aimg.anchor.set(0,0);
			aimg.x = ii*iwidth+offset+iwidth*si;
			aimg.y = 0;
			aimg.scale.x = scale;
			ui_areas_container.addChild(aimg);
		}
	}

	ui_brain_container.scale.set(bscale);
	ui_brain_container.position.x = brain_ioffset;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN MOVEMENT
// //////////////////////////// //////////////////////////// //////////////////////////// //

function brainDown(event) {
	if (electrodeMoving) {return;}

	this.isdown = true;
  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  this.offX = pos.x - this.x;
  this.offY = pos.y - this.y;
  ui_brains_container.alpha = 0.5;
  ui_areas_container.visible = true;
}

function brainUp(event) {
	if (electrodeMoving) {return;}

  this.isdown = false;
  ui_brains_container.alpha = 1;
  ui_areas_container.visible = false;
}

function brainMove(event) {
  if (electrodeMoving) {return;}

  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = Math.max(brain_ioffset-bscale*1183*3,Math.min(brain_ioffset,pos.x-this.offX));
    this.position.set(nx,this.position.y);
    ui_mini_overlay_container.position.set(mini_scale/bscale*(-nx+brain_ioffset),ui_mini_overlay_container.position.y);

    // compute the percentage scrolled and use that to light up the menu
  }
}