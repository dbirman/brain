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

// Setup the server
function init() {
  
}

const DATA = require('./data.js');

var port = 8080;
http.listen(port, function(){
  console.log('listening on *: ' + port);

  init();
});