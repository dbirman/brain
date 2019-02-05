
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONALITY
// //////////////////////////// //////////////////////////// //////////////////////////// //

// NEURONS HAVE 4 PIECES OF DATA
// 0: x
// 1: y
// 2: sd
// 3: orientation
// 4: area [V1, MT, ...]

function Electrode(id) {
	// create a new GUI element for the lectrode
	// hard code w/h
	this.id = id;

	let ewidth = 167, eheight = 208;

	let opts = [0xE69F00,0x5230189,0xd55e00,0xC2AA44F];
	this.color = opts[id];

	this.container = views.brain.brainContainer.addChild(new DContainer());

	// this.container.interactive = true;
	// this.container
	// 	.on('pointerdown', elecDown)
	// 	.on('pointermove', elecMove)
	// 	.on('pointerup', elecUp)
	// 	.on('pointerupoutside', elecUp);

	this.sprite = this.container.addChild(PIXI.Sprite.fromImage('./assets/electrode.png'));
	this.sprite.tint = this.color;
	// set the hitArea
	let points = [-10,eheight-5, 
								10,eheight+5,
								ewidth+10,20,
								ewidth-50,-5];
	this.sprite.hitArea = new PIXI.Polygon(points);
	// set other properties
	this.sprite.position.set(iwidth-ewidth+ewidth*(id%2),iheight-eheight+(id<2?0:eheight));
	this.sprite.alpha = 1;
	this.sprite.interactive = true;
	this.sprite
		.on('pointerdown', elecDown)
		.on('pointermove', elecMove)
		.on('pointerup', elecUp)
		.on('pointerupoutside', elecUp);

	views.brain.brainContainer.addChild(this.sprite);

	this.destroy = function () {
		spk_destroy(this.trace);
		this.sprite.destroy();
		this.trace.graphic.destroy();
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
			let idx = row*2+col;

			this.data.hem = hems[idx];
			this.data.type = types[idx];
			if (idx>=2) {
				this.data.x = iwidth-this.data.x;
				this.data.y = this.data.y-iheight;
			}
			// Update needed
			let info = this.data;
			info.id = this.id;
			info.x = Math.floor(info.x); info.y = Math.floor(info.y);

			socket.emit('request',info);
		}
	}

	// Getters
	this.pos = function() {
		if (this.data.neuron!=undefined) {
			return {
				x: this.data.neuron[0],
				y:this.data.neuron[1], 
				rad: this.data.neuron[2]
			}
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

	this.silence = function() {
		this.trace.silent = true;
	}

	this.wake = function() {
		this.trace.silent = false;
	}

	let e_trace_width = ORIGIN_W*(1-views.stim.STIM_W)-4*views.buffer,
		e_trace_height = ORIGIN_H*views.stim.ELEC_V;

	// setup the electrode window
	let buffer = ORIGIN_W*.025;

	this.trace.tx = 0;
	this.trace.ty = id * e_trace_height/4;
	this.trace.sx = this.trace.tx+buffer;
	this.trace.sy = this.trace.ty + e_trace_height/8;
	this.trace.color = this.color;

	// draw the axes
	let g = views.spikes.container.addChild(new PIXI.Graphics());
	// g.lineStyle(1,0x000000,1);
	// g.moveTo(this.trace.tx,this.trace.ty+buffer);
	// g.lineTo(this.trace.tx+buffer/4,this.trace.ty+buffer);
	// g.lineTo(this.trace.tx+buffer/4,this.trace.ty+e_trace_height/4-buffer);
	// g.lineTo(this.trace.tx,this.trace.ty+e_trace_height/4-buffer);
	// this.trace.graphic.beginFill(0x000000,1);
	// this.trace.graphic.drawRect(this.trace.tx,this.trace.ty,e_trace_width,e_trace_height/4-1);

	// draw the circuits
	g.lineStyle(1,this.color,1);

	// get the brain container position and height
	let bc_pos = views.brain.container.getGlobalPosition(),
		bc_height = views.brain.container.height;

	let my_pos = g.getGlobalPosition();

	let brainx = views.buffer*2 + ORIGIN_W*0.5,
		brainy = views.buffer;

	let offset = ORIGIN_H*.03;
	let line_off = (4-id)*offset;
	let mini_off = (4-id)*offset/4;

	g.moveTo(brainx-my_pos.x,brainy-my_pos.y+bc_height*ORIGIN_W*views.static.BRAIN_W/views.brain.container.initialWidth*0.7+mini_off);
	// arc start
	let as = brainy-my_pos.y+bc_height*ORIGIN_W*views.static.BRAIN_W/views.brain.container.initialWidth*0.7+mini_off;
	g.lineTo(mini_off,as);
	g.arcTo(mini_off-offset,as,mini_off-offset,as+offset,offset/2);
	g.lineTo(mini_off-offset,this.trace.sy-offset);
	g.arcTo(mini_off-offset,this.trace.sy,mini_off,this.trace.sy,offset/2);
	g.lineTo(this.trace.sx-offset,this.trace.sy);

	this.trace.graphic = g;

	// add text for location
	let style = new PIXI.TextStyle({
		fill: "black",
		fontSize: views.static.TEXT_HEIGHT,
		fontFamily: views.static.FAMILY,
		// fontWeight: 'thin'
	});
	this.trace.text = views.spikes.container.addChild(new PIXI.Text('Area: ',style));
	this.trace.text.x = this.trace.tx+offset;
	this.trace.text.y = this.trace.ty;

	return this;
}
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ticks;

function spikeElectrodes() {
	for (var ei=0;ei<electrodes.length;ei++) {
		electrodes[ei].trace.g = drawTrace(electrodes[ei].trace,ei);
	}
	ticks = setTimeout(spikeElectrodes,10);
}

function drawTrace(trace,id) {
	// Draw a trace starting at sx and sy
	if (trace.g==undefined) {g = new PIXI.Graphics();} else {g = trace.g; g.clear();}
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
	  electrodes[data.info.id].data.neuron = data.neuron;
	  let side;
	  if (data.info.hem=='r') {
	  	// flip the x axis location
	  	side = 'Right';
	  	electrodes[data.info.id].data.neuron[0] = -electrodes[data.info.id].data.neuron[0];
	  } else {
	  	side = 'Left';
	  }
	  // set trace text
    if (electrodes[data.info.id].currResponse!=undefined) {
      electrodes[data.info.id].trace.text.setText('Area: ' + side + ' ' + areas[data.neuron[4]].name + '; Firing Rate: ' + electrodes[data.info.id].currResponse.toFixed(2));
    }else{
      electrodes[data.info.id].trace.text.setText('Area: ' + side + ' ' + areas[data.neuron[4]].name);
    }
  } else {
  	// set electrode to null
  	electrodes[data.info.id].trace.text.setText('Area: ');
  	electrodes[data.info.id].data.neuron = undefined;
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
	if (event.currentTarget!=this) {return;}
	electrodeMoving = true;
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
	if (event.currentTarget!=this) {return;}
	electrodeMoving = false;

  updateElectrodes('requestData');
  this.isdown = false;
  // this.alpha = 1;
  // change alpha
  views.brain.brainContainer_areas.alpha = 0.50;
  computePartialSensitivity();
}

function elecMove(event) {
	if (event.currentTarget!=this) {return;}
  if (this.isdown) {
    var pos = event.data.getLocalPosition(this.parent);
  	let nx = pos.x-this.offX,
  		ny = pos.y-this.offY;
    this.position.set(nx,ny);
    computePartialSensitivity();
  }
}

function updateElectrodes(callback) {
	console.log(callback);
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
	return spk_addTrace();
}
