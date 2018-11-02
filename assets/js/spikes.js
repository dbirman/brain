
var stick,
    spike_false = [0,0,0,0,0],
    spike_true = [5,50,-10,-5,-2],
    cur_spk = 0,
    spk_max = 50,
    cspk,
    soundBuffer,
    loaded = false;
    
function spk_init() {
  console.log('Loading sound buffers');
  if (!loaded) {
    var request = new XMLHttpRequest();
    request.open("GET", './assets/snd/spike.wav', true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        audioCtx.decodeAudioData(request.response, function(buffer) {soundBuffer=buffer;});
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');        
    }

    request.send();
  }
}

function _spk_play() {
    //creating source node
    var source = audioCtx.createBufferSource();
    //passing in file
    source.buffer = soundBuffer;

    //start playing
    source.connect(audioCtx.destination);  // added
    source.start(0);
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
