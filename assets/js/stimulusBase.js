/**
* A rare opportunity to document properly...
* A Stimulus is a DContainer -- on its own it has no graphics, these need to be added. But by default
* it includes all the necessary functions to be moved around, to call for re-compute, etc. 
*/
class Stimulus extends DContainer {
	constructor (type,computeCallback,x=0,y=0) {
		super();

		this.type = type;
		this.callback = computeCallback;
		this.x = x;
		this.y = y;

		// internal tracking
		this.neverMoved = true;
		this.moved = false;
		this.isdown = false;

		this.interactive = true;
		this
			.on('pointertap',this.clicked)
			.on('pointerdown',this.down)
			.on('pointerup',this.up)
			.on('pointerupoutside',this.up)
			.on('pointermove',this.move);

		ticker.add(this.draw);
	}

	draw() {
		// pass (will be overloaded by children)
	}

	/**
	* When clicked, check if we were moved -- if not open the parameter controls
	*/
	clicked() {
		if (!this.moved) {
			this.showParamView();
		}
	}

	down(event) {
		this.moved = false;
		this.isdown = true;
		// track offset
		let pos = event.data.getLocalPosition(this.parent);
		this.offX = pos.x - this.x;
		this.offY = pos.y - this.y;
	}

	up(event) {
		this.isdown = false;
	}

	move(event) {
	  if (this.isdown) {
			this.dots.isdown = true;
			this.moved = true;
	    var pos = event.data.getLocalPosition(this.parent);
	  	let nx = Math.min(swidth-this.radius*2,Math.max(0,pos.x-this.offX)),
	  		ny = Math.min(sheight-this.radius*2,Math.max(0,pos.y-this.offY));
	    this.position.set(nx,ny);

	    // compute the percentage scrolled and use that to light up the menu
	    this.callback();
	  }
	}

	spawnChild() {
		// Creates a copy at the same location *ONLY IF TOTAL STIMULUS < # ELECTRODES!!*
		if (stimulus.length<views.brain.electrodes.length) {
			console.log('TODO: Implement child spawning');
		}
	}

	destroy() {
		console.log('TODO: Implement destroy -- remove from stimulus array');
		ticker.remove(this.draw);
		spawnChild();

		super.destroy();
	}

	get contrast() {
		return this.alpha;
	}

	set contrast(_contrast) {
		this.alpha = _contrast;
	}

	set size(size) {
		this.updateSize();
		this._size = size;
	}

	get size() {
		return this._size;
	}

	updateSize() {
		// Implement as children
	}
}