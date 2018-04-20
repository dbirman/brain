// Setup express and socket.io
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Return files that are requested (we could filter if needed)
app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendFile(__dirname + '/' + file);
}); 

var connectionList = {};

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  // test code
  // io.to(socket.id).emit('proc',DATA.proc);

  socket.on('disconnect', function(){
  	console.log('disconnect');
  });

  socket.on('request', function(info){
    if ((DATA.proc[info.type]!=undefined) && (DATA.proc[info.type][info.x]!=undefined) && (DATa.proc[info.type][info.x][info.y]!=undefined)) {
      io.to(socket.id).emit('elecInfo',DATA.proc[info.type][info.x][info.y]);
      console.log('Sending data for: ');
      console.log(dat);
    }
  });
});

let mode = false;

// Setup the server
function init() {
  slog('Loading and pre-processing data.');
  DATA.init();
  DATA.preProcess();
  slog('Setting mode to: online');
  console.log('listening on *: ' + port);
  mode = true;
}

const DATA = require('./data.js');

function slog(msg) {
  if (msg.length<=16) {
    console.log('**** SERVER ****');
    console.log(msg);
    console.log('**** ****** ****');
  } else {
    let l = Math.ceil((msg.length-8)/2);
    let stars = '*'.repeat(l);
    console.log(stars+' SERVER '+stars);
    console.log(msg);
    console.log(stars+' ****** '+stars);
  }
}

var port = 8080;
http.listen(port, function(){ init(); });