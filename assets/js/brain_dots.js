// A dots drawing package for changing motion coherence

function dots(n,maxx,maxy,coherence=1,dir=0,spd=1,sz=1) {
	if (arguments.length<3) {
		throw "Three argument *required* for dots";
	}

	this.n = n;
	this.tick = now();
	this.minx = 0;
	this.miny = 0;
	this.maxx = maxx;
	this.maxy = maxy;
	this.x = zeros(n);
	this.y = zeros(n);
	this.coherence = coherence;
	this.coherent = [];
	this.contrast = [];
	this.speed = spd;
	this.size = sz;
	this.szoff = Math.floor(this.size/2);
	this.dir = dir;

	// Don't set up graphics right away
	this.g = new PIXI.Graphics();

	for (var i=0;i<n;i++) {
		this.x[i] = Math.random()*this.maxx;
		this.y[i] = Math.random()*this.maxy;
		this.coherent.push(Math.random()<this.coherence);
		this.contrast.push(Math.random()<0.5);
	}

	this.update = function() {
		let elapsed = (now()-this.tick)/1000;
		this.tick = now();

		let dxy = this.speed*elapsed;

		for (var i=0;i<this.n;i++) {
			this.coherent[i] = Math.random()<this.coherence;
			var xs, ys;
			if (this.coherent[i]) {
				xs = Math.cos(this.dir);
				ys = Math.sin(this.dir);
			} else {
				xs = Math.cos(Math.random()*2*Math.PI);
				ys = Math.sin(Math.random()*2*Math.PI);
			}
			this.x[i] += xs*dxy;
			this.y[i] += ys*dxy;
			let flag = false;
			if (this.x[i]>this.maxx) {this.x[i] -= this.maxx; flag = true;}
			if (this.y[i]>this.maxy) {this.y[i] -= this.maxy; flag = true;}
			if (this.x[i]<0) {this.x[i] += this.maxx; flag = true;}
			if (this.y[i]<0) {this.y[i] += this.maxy; flag = true;}
			if (flag) {this.contrast[i] = Math.random()<0.5;}
		}
	}

	this.draw = function() {
		if (this.g!=undefined) {this.g.clear();}

		// this.g.beginFill(0x7F7F7F,1);

		if (this.isdown) {
			this.g.lineStyle(1,0xFFFFFF,1);
			this.g.drawCircle(this.maxx/2,this.maxy/2,this.maxx/2-1);
		}

		this.g.lineStyle(1,0xFFFFFF,0);

		this.g.beginFill(Number('0x'+rgb2hex_(255),1));
		for (var i=0;i<this.n;i++) {
			if (this.contrast[i]) {
				this.g.drawCircle(Math.round(this.x[i])-this.szoff,Math.round(this.y[i])-this.szoff,this.size);
			}
		}
		this.g.endFill();

		this.g.beginFill(Number('0x'+rgb2hex_(0),1));
		for (var i=0;i<this.n;i++) {
			if (!this.contrast[i]) {
				this.g.drawCircle(Math.round(this.x[i])-this.szoff,Math.round(this.y[i])-this.szoff,this.size);
			}
		}
		this.g.endFill();
	}
}