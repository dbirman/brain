// Generate brain-data.json from PNG files
// Run this once with: node generate-data.js

const fs = require('fs');
const DATA = require('./data.js');

console.log('Loading and pre-processing brain data...');
DATA.init();
DATA.preProcess();

const output = {
  areas: DATA.areas,
  proc: DATA.proc,
  types: DATA.types,
  vars: DATA.vars
};

fs.writeFileSync('./brain-data.json', JSON.stringify(output));
console.log('✓ Generated brain-data.json');
console.log('You can now run this as a static website!');
