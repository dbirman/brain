let ui_container,
	iwidth = 1183, iheight = 880,
	bscale = BRAIN_SCALEV * app.renderer.height / iheight; // pixel size of the images

function uiInit() {
	ui_container = new DContainer();
	app.stage.addChild(ui_container);

	uiMenuInit();
	uiMiniInit();
	uiBrainInit();

	ui_container.sortChildren();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE PICKER
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_elec_container;

function uiElecInit() {
	// Initialize container
	ui_elec_container = new DContainer();

}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE PICKER CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function elecClick() {
	
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MENU BAR RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_menu_container, ui_menu_brain_buttons, ui_menu_viselec_buttons;

function uiMenuInit() {
	// Create buttons and link to appropriate callbacks
	// set menu size
	// let menu_width = MENU_SCALEV*2*window.innerHeight,
	// 	menu_height = MENU_SCALEV*window.innerHeight;
	// // add menu container
	// ui_menu_container = new DContainer();
	// ui_container.addChild(ui_menu_container);
	// // set container properties
	// ui_menu_container.zOrder = 99;
	// ui_menu_container.position.set(10,10);
	// ui_menu_container.interactive = true;
	// ui_menu_container
	// 	.on('click', menuClick);

	// // draw lines
	// ui_menu_graphics = new PIXI.Graphics();
	// ui_menu_graphics.beginFill(0x808080,1);
	// ui_menu_graphics.drawRect(0,0,menu_width,menu_height);
	// ui_menu_graphics.endFill();
	// ui_menu_graphics.lineStyle(1,0x000000,1);
	// ui_menu_graphics.moveTo(1,1);
	// ui_menu_graphics.lineTo(menu_width,1);
	// ui_menu_graphics.lineTo(menu_width,menu_height);
	// ui_menu_graphics.lineTo(1,menu_height);
	// ui_menu_graphics.lineTo(1,1);
	// ui_menu_graphics.moveTo(menu_width/2,1);
	// ui_menu_graphics.lineTo(menu_width/2,menu_height);
	// ui_menu_graphics.moveTo(1,menu_height/2);
	// ui_menu_graphics.lineTo(menu_width,menu_height/2);

	// // add text

	// ui_menu_container.addChild(ui_menu_graphics);
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MENU CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function menuClick(event) {
  var pos = event.data.getLocalPosition(this.parent);
  pos.x = pos.x / this.width;
  pos.y = pos.y / this.height;
  if (this.height <= 0.5) {
  	// clicked in the top half (center on left/right hemisphere)
  	if (pos.x <= 0.5) {
  		// center left
  	} else {
  		// center right
  	}
  } else {
  	// clicked in the bottom half
  	if (pos.x <= 0.5) {
  		// 
  	}

  }
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
	console.log('Not implemented');
	// this.isdown = true;
 //  // calculate offset
 //  var pos = event.data.getLocalPosition(this.parent);
 //  this.offX = pos.x - this.x;
 //  this.offY = pos.y - this.y;
 //  ui_brains_container.alpha = 0.5;
 //  ui_areas_container.visible = true;
}
function miniUp() {
	console.log('Not implemented');
  // this.isdown = false;
  // ui_brains_container.alpha = 1;
  // ui_areas_container.visible = false;
}

function miniMove(event) {
	console.log('Not implemented');
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
	ui_brain_container.position.x = (app.renderer.width - bscale*iwidth)/2;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN MOVEMENT
// //////////////////////////// //////////////////////////// //////////////////////////// //

function brainDown(event) {
	this.isdown = true;
  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  this.offX = pos.x - this.x;
  this.offY = pos.y - this.y;
  ui_brains_container.alpha = 0.5;
  ui_areas_container.visible = true;
}
function brainUp() {
  this.isdown = false;
  ui_brains_container.alpha = 1;
  ui_areas_container.visible = false;
}

function brainMove(event) {
  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = Math.max(-bscale*1183*2.935,Math.min(bscale*80,pos.x-this.offX)),
  		ny = pos.y-this.offY;
  	ny = 0;	
    this.position.set(nx,this.position.y);
    ui_mini_overlay_container.position.set(mini_scale/bscale*(-nx+bscale*80),ui_mini_overlay_container.position.y);

    // compute the percentage scrolled and use that to light up the menu
  }
}