// A dots drawing package for changing motion coherence

function initDots(n,maxx,maxy,coherence,contrast,dir,spd,sz) {
	if (arguments.length < 7) {
		throw new Error('Not enough arguments for initDots()');
	}
	var dots = {};
	dots.n = n;
	dots.tick = now();
	dots.minx = 0;
	dots.miny = 0;
	dots.maxx = maxx;
	dots.maxy = maxy;
	dots.x = zeros(n);
	dots.y = zeros(n);
	dots.coherent = [];
	dots.contrast_ = contrast;
	dots.contrast = [];
	dots.speed = spd;
	dots.size = sz;
	dots.szoff = Math.floor(dots.size/2);
	dots.dir = dir;
	for (var i=0;i<n;i++) {
		dots.x[i] = Math.random()*dots.maxx;
		dots.y[i] = Math.random()*dots.maxy;
		dots.coherent.push(Math.random()<coherence);
		dots.contrast.push(Math.random()<0.5);
	}
	// if (!((dots.size % 2)==1)) {
	// 	console.log('Dot size must be odd');
	// }
	return dots;
}

function updateDots(dots,coherent,contrast,dir) {
	let elapsed = (now()-dots.tick)/1000;
	dots.contrast_ = contrast;
	dots.tick = now();

	let dxy = dots.speed*elapsed;

	if (typeof(dir) !== 'undefined') {dots.dir = dir;}

	for (var i=0;i<dots.n;i++) {
		dots.coherent[i] = Math.random()<coherent;
		var xs, ys;
		if (dots.coherent[i]) {
			xs = Math.cos(dots.dir);
			ys = Math.sin(dots.dir);
		} else {
			xs = Math.cos(Math.random()*2*Math.PI);
			ys = Math.sin(Math.random()*2*Math.PI);
		}
		dots.x[i] += xs*dxy;
		dots.y[i] += ys*dxy;
		let flag = false;
		if (dots.x[i]>dots.maxx) {dots.x[i] -= dots.maxx; flag = true;}
		if (dots.y[i]>dots.maxy) {dots.y[i] -= dots.maxy; flag = true;}
		if (dots.x[i]<0) {dots.x[i] += dots.maxx; flag = true;}
		if (dots.y[i]<0) {dots.y[i] += dots.maxy; flag = true;}
		if (flag) {dots.contrast[i] = Math.random()<0.5;}
	}
	return dots;
}

function drawDots(dots,g) {
	if (g!=undefined) {g.clear();}

	g.beginFill(0x7F7F7F,1);

	if (dots.isdown) {g.lineStyle(1,0xFFFFFF,1);}
	g.drawCircle(dots.maxx/2,dots.maxy/2,dots.maxx/2-1);
	g.endFill();

	g.lineStyle(1,0xFFFFFF,0);

	g.beginFill(Number('0x'+rgb2hex_(Math.round(127.5+127.5*dots.contrast_))),1);
	for (var i=0;i<dots.n;i++) {
		if (dots.contrast[i]) {
			g.drawCircle(Math.round(dots.x[i])-dots.szoff,Math.round(dots.y[i])-dots.szoff,dots.size);
		}
	}
	g.endFill();

	g.beginFill(Number('0x'+rgb2hex_(Math.round(127.5-127.5*dots.contrast_))),1);
	for (var i=0;i<dots.n;i++) {
		if (!dots.contrast[i]) {
			g.drawCircle(Math.round(dots.x[i])-dots.szoff,Math.round(dots.y[i])-dots.szoff,dots.size);
		}
	}
	g.endFill();
}