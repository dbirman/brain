// Data management for brain.js

// Currently this stores data in RAM, but could be ported over to MongoDB at any time

const fs = require('fs'),
  PNG = require('pngjs').PNG;

const DATA = {
	path: './assets/raw',
	types: ['l','m'], // Types of data that may be found
	raw: {},
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
		console.log(files);
		this.getpng(this.path+'/'+folder+'/'+files[0]);
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
  	// Pull out the relevant data and store into raw
  	console.log(png.width);
  	console.log(png.height);
  	for (let xi=0;xi<png.width;xi++) {
  		for (let yi=0;yi<png.height;yi++) {
  			let data = [0,0,0,0];
  			for (let rgba=0;rgba<4;rgba++) {
  				data[rgba] = png.data[yi*png.width + xi + rgba];
  			}
  			// skip if R==255
  			if (!(data[0]==255)) {
  				console.log(data[1]);
  			}
  		}
  	}
  }
}

DATA.init();