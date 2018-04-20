
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONALITY
// //////////////////////////// //////////////////////////// //////////////////////////// //

let electrodes = {};

function Electrode(id) {
	// create a new GUI element for the lectrode
	// hard code w/h
	let ewidth = 167, eheight = 208;
	this.color = Math.random() * 0xFFFFFF;

	this.sprite = PIXI.Sprite.fromImage('./assets/electrode.png');
	this.sprite.tint = this.color;
	// set the hitArea
	let points = [0,eheight, 
								ewidth,30,
								ewidth-50,0];
	this.sprite.hitArea = new PIXI.Polygon(points);
	// set other properties
	this.sprite.interactive = true;
	this.sprite.position.set(-ui_brain_container.position.x+iwidth/2+ewidth/2,ui_brain_container.position.y+iheight/2-eheight);
	this.sprite.alpha = 1;
	this.sprite
		.on('pointerdown', elecDown)
		.on('pointermove', elecMove)
		.on('pointerup', elecUp)
		.on('pointerupoutside', elecUp);

	ui_brain_container.addChild(this.sprite);

	// create the mini electrode
	this.mini_sprite = PIXI.Sprite.fromImage('./assets/electrode.png');
	this.mini_sprite.tint = this.color;
	this.mini_sprite.scale.set(bscale*mini_scale);
	this.mini_sprite.position.set(-50,0);

	ui_mini_electrodes_container.addChild(this.mini_sprite);


	this.destroy = function () {
		this.sprite.destroy();
		this.mini_sprite.destroy();
	}

	this.drawPos = function () {
		// .. pass .. (not actually useful to see the pixel location... pixels too small)

		// let x = this.sprite.position.x, y = this.sprite.position.y;
		// if (this.posGraphic!=undefined) {this.posGraphic.destroy();}
		// this.posGraphic = new PIXI.Graphics();
		// this.posGraphic.beginFill(0xFF0000,1);
		// this.posGraphic.drawRect(x,y+eheight,1,1);
		// this.posGraphic.endFill();
		// ui_brain_container.addChild(this.posGraphic); 

		// update the mini_sprite location
		this.mini_sprite.position.set(this.sprite.position.x*bscale*mini_scale,this.sprite.position.y*bscale*mini_scale);
	}

	this.drawPos();
	electrodes[id] = this;

	return this.color;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //


// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

var electrodeMoving = false;

function elecDown(event) {
	if (event.currentTarget==this) {electrodeMoving = true;}
	this.isdown = true;
 //  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  this.offX = pos.x - this.x;
  this.offY = pos.y - this.y;
  this.alpha = 0.5;
}
function elecUp(event) {
	if (event.currentTarget==this) {electrodeMoving = false;}

  this.isdown = false;
  this.alpha = 1;
}

function elecMove(event) {
  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = pos.x-this.offX,
  		ny = pos.y-this.offY;
    this.position.set(nx,ny);
    updateElectrodePos();
  }
}

function updateElectrodePos() {
	let keys = Object.keys(electrodes);
	for (let ki=0;ki<keys.length;ki++) {
		let electrode = electrodes[keys[ki]];
		electrode.drawPos();
	}
}