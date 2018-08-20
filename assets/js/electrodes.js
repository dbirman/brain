
const socket = io();

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONALITY
// //////////////////////////// //////////////////////////// //////////////////////////// //

function Electrode(id) {
	// create a new GUI element for the lectrode
	// hard code w/h
	this.id = id;

	let ewidth = 167, eheight = 208;

	let opts = [0xFF0000,0x00FF00,0x0000FF,0xFF00FF,0x00FFFF];
	this.color = opts[id];

	this.sprite = PIXI.Sprite.fromImage('./assets/electrode.png');
	this.sprite.tint = this.color;
	// set the hitArea
	let points = [0,eheight, 
								ewidth,30,
								ewidth-50,0];
	this.sprite.hitArea = new PIXI.Polygon(points);
	// set other properties
	this.sprite.interactive = true;
	this.sprite.position.set(iwidth-ewidth+ewidth*(id%2),iheight-eheight+(id<2?0:eheight));
	this.sprite.alpha = 1;
	this.sprite
		.on('pointerdown', elecDown)
		.on('pointermove', elecMove)
		.on('pointerup', elecUp)
		.on('pointerupoutside', elecUp);

	views.brain.elecContainer.addChild(this.sprite);

	// // create the mini electrode
	// this.mini_sprite = PIXI.Sprite.fromImage('./assets/mini.png');
	// this.mini_sprite.tint = this.color;
	// this.mini_sprite.anchor.set(0.5,0.5);
	//  // Set the scale so that the sprites take up 15% of the height of the container
	// this.mini_sprite.scale.set(0.15*ui_mini_container.height/98); 
	// this.mini_sprite.position.set(-1000,-1000);

	// ui_mini_electrodes_container.addChild(this.mini_sprite);

	this.destroy = function () {
		clearTimeout(ticks[this.id]);
		delete ticks[this.id];
		spk_destroy(this.trace);
		this.sprite.destroy();
		this.mini_sprite.destroy();
		this.trace.graphic.destroy();
	}

	this.drawPos = function () {
	// 	// update the mini_sprite location
	// 	this.mini_sprite.position.set((this.sprite.position.x)*mini_scale,(this.sprite.position.y+this.sprite.height)*mini_scale);
	}

	this.data = {};

	this.requestData = function () {
		let x = this.sprite.position.x,
			y = this.sprite.position.y;
		if ((x!=this.data.x) || (y!=this.data.y)) {
			this.data.x = x % iwidth;
			this.data.y = y+eheight;
			let types = ['l','m','m','l'];
			let hems = ['l','l','r','r'];
			// figureo ut which hemisphere we are in
			let col = Math.floor(x/iwidth),
				row = Math.floor(y/iheight);
			let idx = col*2+row;
			this.data.hem = hems[idx];
			this.data.type = types[idx];
			if (idx>=2) {
				this.data.x = iwidth-this.data.x;
			}
			// Update needed
			let info = this.data;
			info.id = this.id;
			info.x = Math.floor(info.x); info.y = Math.floor(info.y);

			socket.emit('request',info);
		}
	}

	// Getters
	this.getSize = function() {
		if (this.data.neuron!=undefined) {
			return {pos: new PIXI.Point(this.data.neuron[0],this.data.neuron[1]), rad: this.data.neuron[2]};
		} else {
			return undefined;
		}
	}

	this.getTheta = function() {
		if (this.data.neuron != undefined) {
			return this.data.neuron[3];
		} else {
			return undefined;
		}
	}

	// Setters

	this.trace = createElectrodeTrace();

	this.setRate = function (rate) {
		spk_setRate(this.trace,rate);
	}

	this.spike = function() {
		spike(this.id);
	}

	this.silence = function() {
		this.trace.silent = true;
	}

	this.wake = function() {
		this.trace.silent = false;
	}

	let e_trace_width = ORIGIN_WIDTH*views.stim.ELECTRODES,
		e_trace_height = ORIGIN_HEIGHT*0.8;

	// setup the electrode window
	this.trace.tx = ORIGIN_WIDTH-ORIGIN_WIDTH*views.stim.ELECTRODES-10;
	this.trace.ty = ORIGIN_HEIGHT*0.1 + id * e_trace_height/4;
	this.trace.sx = this.trace.tx;
	this.trace.sy = this.trace.ty+e_trace_height;
	this.trace.color = this.color;

	// draw black square (crush by 5 pixels)
	this.trace.graphic = views.stim.spikeContainer.addChild(new PIXI.Graphics());
	this.trace.graphic.beginFill(0x000000,1);
	this.trace.graphic.drawRect(this.trace.tx,this.trace.ty,e_trace_width,e_trace_height/4-1);

	this.drawPos();

	return this;
}
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ticks = {};

function spike(id) {
	if (views.stim.visible) {
		let trace = views.brain.electrodes[id].trace;
		if (trace.g!=undefined) {trace.g.destroy();}
		trace.g = drawTrace(trace,id);
		ticks[id] = setTimeout(function() {spike(id);},10);
	} else {
		clearTimeout(ticks[id]);
	}
}

function drawTrace(trace,id) {
	// Draw a trace starting at sx and sy
	g = new PIXI.Graphics();
	g.lineStyle(1,trace.color,1);
	g.moveTo(trace.sx,trace.sy-trace.spk[0]);
	for (let ii=1;ii<trace.spk.length;ii++) {
		g.lineTo(trace.sx+ii,trace.sy-trace.spk[ii]);
	}
	trace.graphic.addChild(g);
	return g;
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

// Receive data about electrodes
socket.on('elecInfo', function(data) {
  // do something with this information
  if (data.neuron!=undefined) {
	  views.brain.electrodes[data.info.id].data.neuron = data.neuron;
	  if (data.info.hem=='r') {
	  	// flip the x axis location
	  	views.brain.electrodes[data.info.id].data.neuron[0] = -views.brain.electrodes[data.info.id].data.neuron[0];
	  }
  }
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
  // this.alpha = 0.5;
  // change alpha
  views.brain.brainContainer_areas.alpha = 0.75;
}

function elecUp(event) {
  if (event.currentTarget==this) {electrodeMoving = false;}

  updateElectrodes('requestData');
  this.isdown = false;
  // this.alpha = 1;
  // change alpha
  views.brain.brainContainer_areas.alpha = 0.50;
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
	let keys = Object.keys(views.brain.electrodes);
	for (let ki=0;ki<keys.length;ki++) {
		let electrode = views.brain.electrodes[keys[ki]];
		electrode[callback]();
	}
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE TRACES + TRACE BOXES
// //////////////////////////// //////////////////////////// //////////////////////////// //

function createElectrodeTrace() {
	return spk_addTrace();
}
