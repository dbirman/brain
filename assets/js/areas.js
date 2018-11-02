let maxFire = 50;

// The data code uses the function mappings to communicate which response function
// to use for contrast/coherence sensitivity. The parameters are stored by area.
const areas =  {
	0: {
		name: 'V1',
		func: responseV1,
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
		theta_sd: Math.PI/2.5,
		pdf_max: normpdf(0,0,Math.PI/2),
		contrast: {
			func: function(x) {return insensitive(x,{max:1})}
		},
		coherence: {
			func: function(x) {return linear(x,{slope:2,b0:0})}
		}
	}
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

	let sens = normpdf(elec.getTheta()-stim.theta,0,areas[1].theta_sd)/areas[1].pdf_max;
	let coh = areas[1].coherence.func(stim.coherence);
	let con = areas[1].contrast.func(stim.contrast);


	if (stim.type=='motion') {
		// Multiply this by all factors
		response *= sens * coh * con;
	} else {
		// Multiply by the response to contrast, but reduce to 10% (no motion)
		response *= sens * con * 0.1;
	}
	return response;
}

function responseV1(elec,stim) {
	// A V1 neuron cares only that things have contrast (and orientation?)
	let response = maxFire;

	// Compute the overlap
	overlap = computeOverlap(elec.pos(),stim.pos) / (Math.PI * elec.pos().rad**2);

	response *= overlap;

	let con = areas[0].contrast.func(stim.contrast);

	response *= con;

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
