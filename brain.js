// Setup express and socket.io
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Return files that are requested (we could filter if needed)
app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    // console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendfile("./" + file);
}); 

var connectionList = {};

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.on('disconnect', function(){
  	console.log('disconnect');
  });
});

require('./data.js');

var port = 8080;
http.listen(port, function(){
  console.log('listening on *: ' + port);

  // var data = new DATA();
  // data.init();

  // var lkeys = Object.keys(load);
  // for (var i=0;i<lkeys.length;i++) {
  //   console.log('Found stimulus: ' + load[lkeys[i]].stim);
  //   console.log('Found region data for: ' + load[lkeys[i]].area);
  //   if (data[load[lkeys[i]].stim]==undefined) {data[load[lkeys[i]].stim]={};}
  //   data[load[lkeys[i]].stim][load[lkeys[i]].area] = load[lkeys[i]].data;
  // }
  // load = {};
});