
const socket = io();

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONALITY
// //////////////////////////// //////////////////////////// //////////////////////////// //

let electrodes = {},
	e_trace_top = MENU_SCALEV*app.renderer.height,
	e_trace_height = BRAIN_SCALEV*app.renderer.height,
	e_trace_left = (1-ELEC_SCALEH)*app.renderer.width,
	e_trace_width = (ELEC_SCALEH-0.05)*app.renderer.width;

function Electrode(id) {
	// create a new GUI element for the lectrode
	// hard code w/h
	this.id = id;

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
	console.log(ui_brain_container.position.x);
	this.sprite.position.set(brain_ioffset-ui_brain_container.position.x/bscale+iwidth/2,ui_brain_container.position.y+iheight/2-eheight);
	this.sprite.alpha = 1;
	this.sprite
		.on('pointerdown', elecDown)
		.on('pointermove', elecMove)
		.on('pointerup', elecUp)
		.on('pointerupoutside', elecUp);

	ui_brain_container.addChild(this.sprite);

	// create the mini electrode
	this.mini_sprite = PIXI.Sprite.fromImage('./assets/electrode_mini.png');
	this.mini_sprite.tint = this.color;
	this.mini_sprite.scale.set(bscale*mini_scale);
	this.mini_sprite.position.set(-50,0);

	ui_mini_electrodes_container.addChild(this.mini_sprite);

	this.destroy = function () {
		clearTimeout(ticks[this.id]);
		delete ticks[this.id];
		this.sprite.destroy();
		this.mini_sprite.destroy();
		this.trace.graphic.destroy();
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
		this.mini_sprite.position.set((this.sprite.position.x)*mini_scale,(this.sprite.position.y-this.mini_sprite.height)*mini_scale);
	}

	this.data = {};

	this.requestData = function () {
		if ((this.sprite.position.x!=this.data.x) || (this.sprite.position.y!=this.data.y)) {
			this.data.x = this.sprite.position.x % 1183;
			this.data.y = this.sprite.position.y+eheight;
			let types = ['l','m','m','l'];
			let idx = Math.floor(this.sprite.position.x/1183);
			this.data.type = types[idx];
			if (idx>=2) {
				this.data.x = 1183-this.data.x;
			}
			// Update needed
			let info = this.data;
			info.id = this.id;
			info.x = Math.floor(info.x); info.y = Math.floor(info.y);

			socket.emit('request',info);
		}
	}

	this.trace = createElectrodeTrace();

	this.setRate = function (rate) {
		spk_setRate(trace,rate);
	}

	// setup the electrode window
	this.trace.tx = e_trace_left;
	this.trace.ty = e_trace_top+e_trace_height*this.id/4;
	this.trace.sx = this.trace.tx;
	this.trace.sy = this.trace.ty+e_trace_height*1.5/8;
	this.trace.color = this.color;

	// draw black square (crush by 5 pixels)
	this.trace.graphic = new PIXI.Graphics();
	this.trace.graphic.beginFill(0x000000,1);
	this.trace.graphic.drawRect(this.trace.tx,this.trace.ty,e_trace_width,e_trace_height/4);

	ui_spike_container.addChild(this.trace.graphic);

	this.drawPos();
	electrodes[id] = this;
	spike(this.id);

	return this.color;
}
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ticks = {};

function spike(id) {
	ticks[id] = setTimeout(function() {spike(id);},10);
	let trace = electrodes[id].trace;
	if (trace.g!=undefined) {trace.g.destroy();}
	trace.g = drawTrace(this.trace);
	trace.graphic.addChild(trace.g);
}

function drawTrace(trace) {
	// Draw a trace starting at sx and sy
	g = new PIXI.Graphics();
	g.lineStyle(1,trace.color,1);
	g.moveTo(trace.sx,trace.sy-trace.spk[0]);
	for (let ii=1;ii<trace.spk.length;ii++) {
		g.lineTo(trace.sx+ii,trace.sy-trace.spk[ii]);
	}
	return g;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

// Receive data about electrodes
socket.on('elecInfo', function(data) {
  // do something with this information
  electrodes[data.id].data.neuron = data.neuron;
});

// let data;
// socket.on('proc', function(proc) {console.log('received proc'); data = proc; testData();});

// function testData() {
// 	// Cruise through data and plot every point (that exists) onto 
// 	let ldata = data.l;

// 	g = new PIXI.Graphics();
// 	ui_brain_container.addChild(g);

// 	g.beginFill(0xFF0000,1);
// 	for (let x=0;x<1183;x++) {
// 		for (let y=0;y<880;y++) {
// 			if ((ldata[x]!=undefined) && (ldata[x][y]!=undefined)) {
// 				g.drawRect(x,y,1,1);
// 			}
// 		}
// 	}
// }

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE CALLBACKS
// //////////////////////////// //////////////////////////// //////////////////////////// //

var electrodeMoving = false;

function elecDown(event) {
  if (event.currentTarget==this) {electrodeMoving = true;}
  this.isdown = true;
  // calculate offset
  var pos = event.data.getLocalPosition(this.parent);
  this.offX = pos.x - this.x;
  this.offY = pos.y - this.y;
  this.alpha = 0.5;
}

function elecUp(event) {
  if (event.currentTarget==this) {electrodeMoving = false;}

  updateElectrodes('requestData');
  this.isdown = false;
  this.alpha = 1;
}

function elecMove(event) {
  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = pos.x-this.offX,
  		ny = pos.y-this.offY;
    this.position.set(nx,ny);
  	updateElectrodes('drawPos');
  }
}

function updateElectrodes(callback) {
	let keys = Object.keys(electrodes);
	for (let ki=0;ki<keys.length;ki++) {
		let electrode = electrodes[keys[ki]];
		electrode[callback]();
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE TRACES + TRACE BOXES
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createElectrodeTrace() {
	trace = spk_addTrace();

	return trace;
}
