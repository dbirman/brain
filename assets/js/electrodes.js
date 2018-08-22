
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONALITY
// //////////////////////////// //////////////////////////// //////////////////////////// //
function makeAllElectrodesVisible(blobs) {
	for (var ei=0;ei<electrodes.length;ei++) {
		// electrodes[ei].sprite.visible = !blobs;
		electrodes[ei].blob.visible = blobs;
	}
}

function Electrode(id) {
	// create a new GUI element for the lectrode
	// hard code w/h
	this.id = id;

	let ewidth = 167, eheight = 208;

	let opts = [0xFF0000,0x00FF00,0x0000FF,0xFF00FF,0x00FFFF];
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
	let points = [0,eheight, 
								ewidth,30,
								ewidth-50,0];
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

	// attach to the electrode sprite a "blob" of the same color 

	this.blob = this.sprite.addChild(new PIXI.Graphics());

	this.blob.beginFill(opts[id]);
	let radius = ewidth*0.50;
	this.blob.drawCircle(radius,radius,radius);
	this.blob.position.set(-radius,eheight-radius);
	// this.blob.position.set(iwidth-ewidth+ewidth*(id%2)-radius,iheight-eheight+(id<2?0:eheight)+radius);

	this.blob.visible = false;

	this.blob.interactive = true;
	this.blob
		.on('pointerdown', elecDown)
		.on('pointermove', elecMove)
		.on('pointerup', elecUp)
		.on('pointerupoutside', elecUp);

	views.brain.brainContainer.addChild(this.sprite);

	this.destroy = function () {
		clearTimeout(ticks[this.id]);
		delete ticks[this.id];
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

	this.spike = function() {
		spike(this.id);
	}

	this.silence = function() {
		this.trace.silent = true;
	}

	this.wake = function() {
		this.trace.silent = false;
	}

	let e_trace_width = ORIGIN_W*(1-views.stim.STIM_W)-views.buffer,
		e_trace_height = ORIGIN_H*views.stim.ELEC_V;

	// setup the electrode window
	this.trace.tx = 0;
	this.trace.ty = id * e_trace_height/4;
	this.trace.sx = this.trace.tx;
	this.trace.sy = this.trace.ty+ id * e_trace_height/4 + e_trace_height/8;
	this.trace.color = this.color;

	// draw black square (crush by 5 pixels)
	this.trace.graphic = views.spikes.container.addChild(new PIXI.Graphics());
	this.trace.graphic.beginFill(0x000000,1);
	this.trace.graphic.drawRect(this.trace.tx,this.trace.ty,e_trace_width,e_trace_height/4-1);

	// add text for location
	let style = new PIXI.TextStyle({
		fill: "black",
		fontSize: views.static.TEXT_HEIGHT
	});
	this.trace.text = views.spikes.container.addChild(new PIXI.Text('Area: ',style));
	this.trace.text.x = this.trace.tx;
	this.trace.text.y = this.trace.ty-style.fontSize;

	return this;
}
// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

let ticks = {};

function spike(id) {
	if (views.stim.visible) {
		let trace = electrodes[id].trace;
		if (trace.g!=undefined) {trace.g.destroy();}
		trace.g = drawTrace(trace,id);
		ticks[id] = setTimeout(function() {spike(id);},10);
	} else {
		clearTimeout(ticks[id]);
	}
}

function drawTrace(trace,id) {
	console.log('here');
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
  console.log(data.neuron);
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
	  electrodes[data.info.id].trace.text.setText('Area: ' + side + ' ' + areas[data.neuron[4]].name);
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
