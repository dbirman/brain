
var stick,
    spikes = [],
    spike_false = [0,0,0,0,0],
    spike_true = [5,50,-10,-5,-2],
    cur_spk = 0,
    spk_max = 50,
    cspk,
    loaded = false;
    
function spk_init() {
  if (!loaded) {
    console.log('initializing spikes');
    if (browser=="Firefox") {
      cspk = new Audio("./assets/snd/spike_16.wav");
    } else {
      cspk = new Audio("./assets/snd/spike.wav");
    }
    cspk.load();
    cspk.onloadeddata = function () {
      for (var i=0;i<50;i++) {
        spikes.push(cspk.cloneNode());
        spikes[spikes.length-1].oncanplay = function() {alert('meow'); console.log('meow');}
      }
    }
    loaded = true;
  }
}

// Add a new spike trace
function spk_addTrace() {
  trace = {};
  trace.rate = 0; // average firing rate per second
  trace.spk = zeros(ORIGIN_W*(1-views.stim.STIM_W)-7*views.buffer);
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

function spk_destroy(trace) {
  clearTimeout(trace.tick);
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
  spikes[cur_spk++].play();
  cur_spk = cur_spk>=spikes.length ? 0 : cur_spk;
}
