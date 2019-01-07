let maxFire = 50;

// The data code uses the function mappings to communicate which response function
// to use for contrast/coherence sensitivity. The parameters are stored by area.
const areas =  {
	0: {
		name: 'V1',
		func: responseV1,
		theta_sd: Math.PI/5,
		pdf_max: normpdf(0,0,Math.PI/5),
		contrast: {
			func: function(x) {return nakarushton(x,{rmax:1,x50:0.25})}
		},
		coherence: {
			func: function(x) {return insensitive(x,{max:1})}
		}
	},
	1: {
		name: 'MT',
		func: responseMT,
		theta_sd: Math.PI/3.5,
		pdf_max: normpdf(0,0,Math.PI/3.5),
		contrast: {
			func: function(x) {return insensitive(x,{max:1})}
		},
		coherence: {
			func: function(x) {return linear(x,{slope:2,b0:0})}
		}
	},
	2: {
		name: 'Retina',
		func: responseRet,
		theta_sd: Math.PI/12,
		pdf_max: normpdf(0,0,Math.PI/12),
		contrast: {
			func: function(x) {return insensitive(x,{max:1})}
		},
		coherence: {
			func: function(x) {return insensitive(x,{max:1})}
		}
	},
	3: {
		name: 'LGN',
		func: responseLGN,
		theta_sd: Math.PI/10,
		pdf_max: normpdf(0,0,Math.PI/10),
		contrast: {
			func: function(x) {return insensitive(x,{max:1})}
		},
		coherence: {
			func: function(x) {return insensitive(x,{max:1})}
		}
	},
	4: {
		name: 'V2',
		func: responseV2,
		theta_sd: Math.PI/6,
		pdf_max: normpdf(0,0,Math.PI/6),
		contrast: {
			func: function(x) {return nakarushton(x,{rmax:1,x50:0.10})}
		},
		coherence: {
			func: function(x) {return insensitive(x,{max:1})}
		}
	},
};


// //////////////////////////// //////////////////////////// //////////////////////////// //
// ELECTRODE/STIMULUS CALCULATIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

function responseMT(elec,stim) {
	// An MT neuron cares slightly about things that have contrast, but mostly
	// about things that have motion
	let response = maxFire;

	// Compute the overlap
	overlap = computeOverlap(elec.pos(),stim.pos) / (Math.PI * elec.pos().rad**2);

	response *= overlap;

	// compute the selectivity, contrast, coherence

	let sens = normpdf(angdist(elec.getTheta(),stim.theta),0,areas[1].theta_sd)/areas[1].pdf_max;
	let coh = areas[1].coherence.func(stim.coherence);
	let con = areas[1].contrast.func(stim.contrast);


	if (stim.type=='motion') {
		// Multiply this by all factors
		response *= sens * coh * con;
	} else {
		// Multiply by the response to contrast, but reduce to 10% (no motion)
		response *= sens * con * 0.1;
	}

	response = response<0.2 ? -1 : response;

	return response;
}

function responseV1(elec,stim) {
	// A V1 neuron cares only that things have contrast (and orientation?)
	let response = maxFire;

	// Compute the overlap
	overlap = computeOverlap(elec.pos(),stim.pos) / (Math.PI * elec.pos().rad**2);

	response *= overlap;

	let sens = normpdf(Math.min(angdist(elec.getTheta(),stim.theta),angdist(elec.getTheta(),stim.theta+Math.PI)),0,areas[0].theta_sd)/areas[0].pdf_max;
	let con = areas[0].contrast.func(stim.contrast);

	if (stim.type=='gaussian') {
		response *= con * 0.25;
	} else if (stim.type=='gabor') {
		response *= sens * con;
	} else if (stim.type=='motion') {
		response *= con * 0.15;
	}

	response = response<0.2 ? -1 : response;

	return response;

}

function responseRet(elec,stim) {
	// retina is a point detector, simply responds maximally when overlapped
	let response = maxFire;

	// Compute the overlap
	overlap = computeOverlap(elec.pos(),stim.pos) / (Math.PI * elec.pos().rad**2);

	response *= overlap;

	response = response<0.2 ? -1 : response;

	return response;
}

function responseLGN(elec,stim) {
	let response = maxFire;

	// Compute the distance
	// if we are within 1 SD, as normal, but 1-2 SD, invert the firing rate
	let ep = elec.pos();
	let sp = stim.pos;

	let dist = Math.sqrt((ep.x-sp.x)**2+(ep.y-sp.y)**2);
	let dratio = dist/ep.rad;

	if (dratio>8) {return -1;}

	if (stim.type=='motion') {
		// don't fire, active inhibition (covers both on and off regions)
		return 0;

	} else {
		// different behavior based on whether this is a center-on or -off cell
		if (elec.data.neuron[3]) {
			// on center neuron
			response *= dratio < 5 ? (Math.cos(dratio*Math.PI/5)+1)/2 : 0;
		} else {
			// off center neuron
			response *= dratio < 10 ? (Math.cos((dratio-5)*Math.PI/5)+1)/2 : 0;
		}
	}

	return response;
}

function responseV2(elec,stim) {
	// response V2 is identical to response V1, but V2 "complex cells"
	// don't care about overlap, just distance (use FWHM, so ~2.2*SD)

	// A V1 neuron cares only that things have contrast (and orientation?)
	let response = maxFire;

	// Compute the distance
	let ep = elec.pos();
	let sp = stim.pos;

	let dist = Math.sqrt((ep.x-sp.x)**2+(ep.y-sp.y)**2);
	let dratio = dist/ep.rad;
	console.log(dist);

	let fwhm = ep.rad*2.2;

	if (dist > fwhm) {
		response = 0;
	} else if (dist > (fwhm-0.5)) {
  	// if we are too far away, drop off linearly 1->0 with distance
  	response *= (fwhm-dist-0.5)/0.5+1;
  }

	let sens = normpdf(Math.min(angdist(elec.getTheta(),stim.theta),angdist(elec.getTheta(),stim.theta+Math.PI)),0,areas[0].theta_sd)/areas[0].pdf_max;
	let con = areas[0].contrast.func(stim.contrast);

	if (stim.type=='gaussian') {
		response *= con * 0.25;
	} else if (stim.type=='gabor') {
		response *= sens * con;
	} else if (stim.type=='motion') {
		response *= con * 0.15;
	}

	response = response<0.2 ? -1 : response;

	return response;
}

function computeOverlap(p1,p2) {
	return circIntersect(p1.x,p1.y,p1.rad,p2.x,p2.y,p2.rad);
}

// //////////////////////////// //////////////////////////// //////////////////////////// //
// RESPONSE FUNCTIONS
// //////////////////////////// //////////////////////////// //////////////////////////// //

// INSENSITIVE RESPONSE (if x>0, max response)
// max
function insensitive(x,params) {
	return arrayMap(x,
		function(x,params) {return x>0.01 ? params.max : 0;},
		params);
}
// LINEAR RESPONSE FUNCTION
// slope
// b0
function linear(x,params) {
	return arrayMap(x,
		function(x,params) {return params.b0 + x*params.slope;},
		params);
}
// NAKA RUSHTON RESPONSE FUNCTION
// rmax
// x50
function nakarushton(x,params) {
	return arrayMap(x,
		function(x,params) {
			let p = 0.3, q = 1.6;
			return params.rmax * ((Math.pow(x,p+q)) / (Math.pow(x,q)+Math.pow(params.x50,q)));
		},
		params);
}

function normpdf(x,mu,sd) {
	return 1 / Math.sqrt(2*Math.PI*Math.pow(sd,2)) * Math.exp(-Math.pow(x-mu,2)/(2*Math.pow(sd,2)));
}

// },
function arrayMap(array,func,params) {
	if (Array.isArray(array)) {
		out = [];
		for (let ai=0;ai<array.length;ai++) {
			out.push(func(array[ai],params));
		}
	} else {
		out = func(array,params);
	}
	return out;
}
