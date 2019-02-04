// Data management for brain.js

// Currently this stores data in RAM, but could be ported over to MongoDB at any time

// RULES
// x

//
const fs = require('fs'),
PNG = require('pngjs').PNG;

const DATA = {
	areas: {
		'V1' : {
			order: 0,
			orient: function() {return Math.random()*2*Math.PI;}
		},
		'MT' : {
			order: 1,
			orient: function() {return Math.random()*2*Math.PI;}
		},
		'Ret' : {
			order: 2,
		},
		'LGN' : {
			order: 3,
			ontype: function() {return Math.floor(Math.random()*2);}
		},
		'V2' : {
			order: 4,
			orient: function() {return Math.random()*2*Math.PI;}
		},
		'FEF' : {
			order: 5,
			orient: function() {return -1;}
		}
	},
	path: './assets/data/raw',
	types: ['l','m'], // Types of data that may be found
	vars: ['x','y','sd'], // variables and their ordering
	proc: {},
	raw: {},
	// RULES
	rules: {
		x: {
			stops: [0,255],
			vals: [-30,30]
		},
		y: {
			stops: [0,255],
			vals: [-25,25]
		},
		sd: {
			stops: [0,255],
			vals: [0.5,10]
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
  				
  				// add the extra infos
  				// add the orientation data
  				if ((DATA.areas[area].orient!=undefined) && (this.raw[type][xi][yi][3]==undefined)) {
  					this.raw[type][xi][yi][3] = DATA.areas[area].orient();
  				}
  				// if this an area with ontype information, add that (e.g. LGN)
  				if ((DATA.areas[area].ontype!=undefined) && (this.raw[type][xi][yi][3]==undefined)) {
  					this.raw[type][xi][yi][3] = DATA.areas[area].ontype();
  				}
  				// add the area
  				if (this.raw[type][xi][yi][4]==undefined) {
  					this.raw[type][xi][yi][4] = DATA.areas[area].order;
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