// Data management for brain.js

// Currently this stores data in RAM, but could be ported over to MongoDB at any time

// RULES
// x

//
const fs = require('fs'),
PNG = require('pngjs').PNG;

const DATA = {
	path: './assets/raw',
	types: ['l','m'], // Types of data that may be found
	vars: ['x','y','sd','contrast','coherence'], // variables and their ordering
	proc: {},
	raw: {},
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
		},
		p: {
			vals: [0,2*Math.PI];	
		},
		contrast: {
			stops: [0,10,255],
			vals: [0,10,]
		},
	},
	// INIT
	// Initialize this data file
	init: function() {
		console.log(this.rules);
		let folders = fs.readdirSync(this.path);
		folders.forEach(function (folder) {
			if (! /^\..*/.test(folder)) {
				DATA.load(folder);
			}
		});
		this.processData();
	},
	// LOAD
	// Load all data from the data files and save them into storage
	load: function(folder) {
		console.log('Loading data from: ' + folder);
		let files = fs.readdirSync(this.path+'/'+folder);
		for (let fi=0;fi<files.length;fi++) {
			if (! /^\..*/.test(files[fi])) {
				this.getpng(this.path+'/'+folder+'/'+files[fi]);
			}
		}
	},
	// GET
	// Return the data object for a single x/y point
	get: function(x,y,type) {
		return raw[type][x][y];
	},
	// GETPNG
	getpng: function(filename) {
		var data = fs.readFileSync(filename);
		var png = PNG.sync.read(data, {filterType:-1});
		return this.parsepng(png,filename);
	},
  // PARSE
  parsepng: function(png,filename) {
  	// Get the type from the filename
  	let type = filename.includes('l_') ? 'l' : 'm';
  	if (this.raw[type]==undefined) {
  		this.raw[type] = [];
  	}
  	// Get the variable position (x/y/sd/etc)
  	let varpos = this.vars.indexOf(filename.slice(filename.indexOf(type)+2,filename.length-4));
  	// Pull out the relevant data and store into raw
  	for (let xi=0;xi<png.width;xi++) {
  		for (let yi=0;yi<png.height;yi++) {
  			let data = [0,0,0,0];
  			for (let rgba=0;rgba<4;rgba++) {
  				data[rgba] = png.data[yi*png.width + xi + rgba];
  			}
  			// skip if R==255
  			if (!(data[0]==255)) {
  				// save the green value
  				if (this.raw[type][xi]==undefined) {
  					this.raw[type][xi] = [];
  				}
  				if (this.raw[type][xi][yi]==undefined) {
  					this.raw[type][xi][yi] = [];
  				}
  				this.raw[type][xi][yi][varpos] = data[1];
  			}
  		}
  	}
  },
  processData: function() {
  	// Process the raw data. Convert according to the rules
  }
}

DATA.init();

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