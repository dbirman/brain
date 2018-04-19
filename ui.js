
function uiInit() {
	uiMenuInit();
	uiBrainInit();
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MENU BAR RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ui_menu_container, ui_menu_brain_buttons, ui_menu_viselec_buttons;

function uiMenuInit() {
	// Create buttons and link to appropriate callbacks
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// MENU CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //


// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //


let ui_brain_container, ui_brains;

function uiBrainInit() {
	var iwidth = 1183; // pixel width of the images

	// create a container
	ui_brain_container = new PIXI.Container();
	// make the container interactive
	ui_brain_container.interactive = true;
	ui_brain_container.pointer = 'grab';
	ui_brain_container
		.on('pointerdown', brainDown)
		.on('pointermove', brainMove)
		.on('pointerup', brainUp)
		.on('pointerupoutside', brainUp);

	// add to stage
	app.stage.addChild(ui_brain_container);

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
			console.log(img)
			img.anchor.set(0,0);
			img.x = ii*iwidth+offset+iwidth*si;
			img.y = 0;
			img.scale.x = scale;

			ui_brains[side][itype] = img;

			ui_brain_container.addChild(ui_brains[side][itype]);
		}
	}

	// Listen for animate update
	app.ticker.add(function(delta) {
	    // just for fun, let's rotate mr rabbit a little
	    // delta is 1 if running at 100% performance
	    // creates frame-independent transformation
	    // ui_brains.l.lateral.rotation += 0.01 * delta;
	});

}

let ui_brain_mini_rt, ui_brain_mini_sprite;

function brainMiniUpdate() {
	ui_brain_mini_rt = new PIXI.RenderTexture.create(1183*4,880);
	if (ui_brain_mini_sprite!=undefined) {ui_brain_mini_sprite.destroy();}
	// ui_brain_mini_graphics = new PIXI.Graphics(ui_brain_mini_rt);
	// ui_brain_mini_graphics.beginFill(0xffffff,1);
	// ui_brain_mini_graphics.drawRect(0,0,1183*4,880);
	// ui_brain_mini_graphics.endFill();
	// app.stage.addChild(ui_brain_mini_graphics);
	ui_brain_mini_sprite = new PIXI.Sprite(ui_brain_mini_rt);
	ui_brain_mini_sprite.scale.set(0.2);
	ui_brain_mini_sprite.anchor.set(0.5,1);
	ui_brain_mini_sprite.x = ORIGIN_WIDTH/2;
	ui_brain_mini_sprite.y = ORIGIN_HEIGHT;
	app.stage.addChild(ui_brain_mini_sprite);

	app.ticker.add(function() {
	    app.renderer.render(ui_brain_container, ui_brain_mini_rt);
	});

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
  this.alpha = 0.5;
}
function brainUp() {
  this.isdown = false;
  this.alpha = 1;
}

function brainMove(event) {
  if (this.isdown) {
      var pos = event.data.getLocalPosition(this.parent);
  	let nx = Math.min(0,pos.x-this.offX),
  		ny = pos.y-this.offY;
  	ny = 0;	
    this.position.set(nx,ny);
  }
}