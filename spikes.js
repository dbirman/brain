
var stick,
    spikes = [],
    spike_false = [0,0,0,0,0],
    spike_true = [5,50,-10,-5,-2],
    cur_spk = 0,
    spk_max = 50;

function spk_init() {
  for (var i=0;i<50;i++) {
    var cspk;
    if (browser=="Firefox") {
      cspk = new Audio("../assets/snd/spike_16.wav");
    } else {
      cspk = new Audio("../assets/snd/spike.wav");
    }
    cspk.load();
    spikes.push(cspk);
  }
}

// Add a new spike trace
function spk_addTrace() {
  trace = {};
  trace.rate = 0; // average firing rate per second
  trace.spk = zeros((ELEC_SCALEH-0.05)*app.renderer.width);
  trace.tick;
  trace.dying = 0;
  trace.silent = false;

  _spk_spike(trace);

  return trace;
}

function spk_setRate(trace,rate) {
  if (rate<0) {rate=0;}
  if (rate>spk_max) {rate=spk_max;}
  trace.rate = rate;
  // if (rate > 0) {
  //   _spk_spike(trace);
  // }
}

function _spk_spike(trace) {
  // check the stop condition
  // if (trace.rate <= 0) {
  //   if (trace.dying>trace.spk.length) {
  //     clearTimeout(trace.tick); 
  //     return
  //   }
  // }

  // Repeat the code
  trace.tick = setTimeout(function() {_spk_spike(trace);},5);
  // Play spikes
  if (Math.random() < trace.rate / 200) {
    if (!trace.silent) {_spk_play();}
    for (var i=0;i<5;i++) {trace.spk.shift(); trace.spk.push(spike_true[i]+randn()*2);}
  } else {
    for (var i=0;i<5;i++) {trace.spk.shift(); trace.spk.push(spike_false[i]+randn()*2);}
  }
}

function _spk_play() {
  spikes[cur_spk].play();
  cur_spk += 1; if(cur_spk>=spikes.length) {cur_spk=0;}
}

function zeros(z) {
  a=[]; for(let zi=0;zi<z;zi++) {a.push(0);}return a;
}

function randn() {
  var x1, x2, rad, y1;
  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    rad = x1 * x1 + x2 * x2;
  } while(rad >= 1 || rad == 0);
  var c = Math.sqrt(-2 * Math.log(rad) / rad);
  return x1 * c;
};
