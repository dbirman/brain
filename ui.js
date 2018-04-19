
// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN RENDERING
// //////////////////////////// //////////////////////////// //////////////////////////// //

function uiInit() {
	uiBrainInit();
}

let ui_brain_container, ui_brains;

function uiBrainInit() {
	// create a container
	ui_brain_container = new PIXI.Container();
	// make the container interactive
	ui_brain_container.interactive = true;
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
		ui_brains.l = {};
		ui_brains.r = {};

		let imgs = ['lateral','medial'];

		for (let ii=0;ii<imgs.length;ii++) {
		  // add the lateral brain image
		  itype = imgs[ii];
			let img = PIXI.Sprite.fromImage('./assets/brain_'+itype+'.png');
			img.anchor.set(0,0);
			img.x = 0;
			img.y = 0;

			ui_brains.l[itype] = img;

			ui_brain_container.addChild(ui_brains.l.lateral);
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


// //////////////////////////// //////////////////////////// //////////////////////////// //
// BRAIN MOVEMENT
// //////////////////////////// //////////////////////////// //////////////////////////// //

function brainDown() {
	
}
function brainUp() {
	
}
function brainMove() {
	
}