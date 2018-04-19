// Data management for brain.js

// Currently this stores data in RAM, but could be ported over to MongoDB at any time

// RULES
// x

//
const fs = require('fs'),
PNG = require('pngjs').PNG;

const DATA = {
	path: './assets/data/raw',
	types: ['l','m'], // Types of data that may be found
	vars: ['x','y','sd'], // variables and their ordering
	proc: {},
	raw: {},
	funcs: {
		linear: linear,
		nakarushton: nakarushton,
		insensitive: insensitive
	},
	// AREAS AND SET VALUES
	areas: {
		V1: {
			contrast: {
				func: nakarushton,
				params: {slope:25,b0:0}
			},
			coherence: {
				func: insensitive,
				params: {max:1}
			},
			orient: function() {return Math.random()*2*Math.PI;}
		},
		MT: {
			contrast: {
				func: insensitive,
				params: {max:1}
			},
			coherence: {
				func: linear,
				params: {slope:10,b0:0}
			},
			orient: function() {return Math.random()*2*Math.PI;}
		}
	},
	// RULES
	rules: {
		x: {
			stops: [0,255],
			vals: [-25,25]
		},
		y: {
			stops: [0,255],
			vals: [-25,25]
		},
		sd: {
			stops: [0,255],
			vals: [1,15]
		}
	},
	// INIT
	// Initialize this data file
	init: function() {
		let folders = fs.readdirSync(this.path);
		folders.forEach(function (folder) {
			if (! /^\..*/.test(folder)) {
				DATA.load(folder);
			}
		});
	},
	// LOAD
	// Load all data from the data files and save them into storage
	load: function(folder) {
		console.log('Loading data from: ' + folder);
		let files = fs.readdirSync(this.path+'/'+folder);
		for (let fi=0;fi<files.length;fi++) {
			if (! /^\..*/.test(files[fi])) {
				this.getpng(this.path+'/'+folder+'/'+files[fi],folder);
			}
		}
	},
	// GET
	// Return the data object for a single x/y point
	get: function(x,y,type) {
		return ((raw[type]!=undefined) && (raw[type][x]!=undefined) && (raw[type][x][y]!=undefined)) ? raw[type][x][y] : undefined;
	},
	// GETPNG
	getpng: function(filename,area) {
		console.log(filename,area);
		var data = fs.readFileSync(filename);
		var png = PNG.sync.read(data, {filterType:-1});
		return this.parsepng(png,filename,area);
	},
  // PARSE
  parsepng: function(png,filename,area) {
  	// Get the type from the filename
  	let type = filename.includes('l_') ? 'l' : 'm';
  	if (this.raw[type]==undefined) {
  		this.raw[type] = [];
  	}

  	// Save the height/width if they aren't already saved
  	if (this.raw[type].height==undefined) {
  		this.raw[type].height=png.height;
  		this.raw[type].width=png.width;
  	}

  	// Use the area to resolve the .orient() function
  	// console.log(DATA.areas[area]);

  	// Get the variable position (x/y/sd/etc)
  	let varpos = this.vars.indexOf(filename.slice(filename.indexOf(type)+2,filename.length-4));
  	// Pull out the relevant data and store into raw
		for (let yi=0;yi<png.height;yi++) {
  		for (let xi=0;xi<png.width;xi++) {
  			let data = [0,0,0,0];
  			for (let rgba=0;rgba<4;rgba++) {
  				data[rgba] = png.data[((yi*png.width + xi)<<2) + rgba];
  			}
  			// skip if R==255
  			if (!(data[0]==255)) {
  				// setup missing arrays if needed
  				if (this.raw[type][xi]==undefined) {
  					this.raw[type][xi] = [];
  				}
  				if (this.raw[type][xi][yi]==undefined) {
  					this.raw[type][xi][yi] = [];
  				}
  				// save the green value to the corresponding position
  				this.raw[type][xi][yi][varpos] = data[1];
  				// add the orientation data
  				if ((DATA.areas[area].orient!=undefined) && (this.raw[type][xi][yi][3]==undefined)) {
  					this.raw[type][xi][yi][3] = DATA.areas[area].orient();
  				}
  			}
  		}
  	}
  },
  preProcess: function() {
  	// Process the raw data. Convert according to the rules in DATA.rules
  	DATA.proc = DATA.raw;
  	for (let ti =0;ti<DATA.types.length;ti++) {
  		let type = DATA.types[ti];
  		console.log('Processing data of type: ' + type);
			for (let yi=0;yi<DATA.proc[type].height;yi++) {
	  		for (let xi=0;xi<DATA.proc[type].width;xi++) {
	  			if ((DATA.proc[type][xi]!=undefined) && (DATA.proc[type][xi][yi]!=undefined)) {
	  				DATA.proc[type][xi][yi] = this.preproc_(DATA.proc[type][xi][yi]);
					}
	  		}
	  	}
  	}
  },
  preproc_: function(data) {
  	// helper function for preprocess
  	data[0] = interp1(data[0],DATA.rules.x.stops,DATA.rules.x.vals);
  	data[1] = interp1(data[1],DATA.rules.y.stops,DATA.rules.y.vals);
  	data[2] = interp1(data[2],DATA.rules.sd.stops,DATA.rules.sd.vals);
  	return data;
  }
}

module.exports = DATA;

// helper functions


// RESPONSE FUNCTIONS
// funcs: {
// INSENSITIVE RESPONSE (if x>0, max response)
// max
function insensitive(x,params) {
	return arrayMap(x,
		function(x,params) {return x>0 ? params.max : 0;},
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
// },

// // RESPONSE FUNCTIONS
// funcs: {
// 	// INSENSITIVE RESPONSE (if x>0, max response)
// 	// max
// 	insensitive: function(x,params) {
// 		return arrayMap(x,
// 			function(x,params) {return x>0 ? params.max : 0;},
// 			params);
// 	},
// 	// LINEAR RESPONSE FUNCTION
// 	// slope
// 	// b0
// 	linear: function (x,params) {
// 		return arrayMap(x,
// 			function(x,params) {return params.b0 + x*params.slope;},
// 			params);
// 	},
// 	// NAKA RUSHTON RESPONSE FUNCTION
// 	// rmax
// 	// x50
// 	nakarushton: function (x,params) {
// 		return arrayMap(x,
// 			function(x,params) {
// 				let p = 0.3, q = 1.6;
// 				return params.rmax * ((Math.pow(x,p+q)) / (Math.pow(x,q)+Math.pow(params.x50,q)));
// 			},
// 			params);
// 	}
// },

function interp1(x,stops,vals) {
	if ((x < stops[0]) || (x > stops[stops.length])) {
		return undefined;
	}
    for (let vi=1;vi<vals.length;vi++) {
    	if (x <= stops[vi]) {
    		x1 = stops[vi-1];
    		x2 = stops[vi];
    		y1 = vals[vi-1];
    		y2 = vals[vi];
    		return y1 + (x-x1) * (y2-y1) / (x2-x1);
    	}
    }
}

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