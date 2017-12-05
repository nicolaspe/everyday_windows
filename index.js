var express		 = require('express');
var app 			 = express();													// express server
var http 			 = require('http').createServer(app);	// http server
var WebSocket  = require('ws').Server								// websocket server
// var io 				 = require('socket.io')(http);
var path			 = require('path');
var bodyParser = require("body-parser");
var port = process.env.PORT || 8090;

var _scene = 0;

// static html
app.use(express.static('public'));
// configure body-parser as middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get('/', (req,res) => {
// 	console.log(req);
// 	res.render(__dirname + '/public/index.html');
// });


// server setup
// 		listen for http connections
http.listen(port, () => {
	console.log('everyday-windows app listening on port ', port);
});


// websocket setup
wss = new WebSocket({ server: http });

wss.on('connection', function(ws_client){
	console.log("user connected");

	// error handling
	ws_client.on('error', function(err){
		console.log("error: " + err);
	});
	// disconnection
	ws_client.on('close', function(){
		console.log("user disconnected");
	});

	// message handling
	ws_client.on('message', function(msg){
		// check if the values are valid/useful
		var intComing = parseInt(msg);
		if(intComing != NaN && intComing>=0 && intComing<=5){
			_scene = parseInt(msg);
			broadcast(_scene);
			console.log("change scene broadcast: " + _scene);
		}
	});
});

function broadcast(msg){
	wss.clients.forEach(function each(client) {
		client.send(msg);
  });
}


// socket.io setup -- deprecated
/*
io.on('connection', function(socket){
	console.log("user connected");
	socket.on('disconnect', function(){
		console.log("user disconnected");
	});
	socket.on('select', function(mode){
		_scene = mode;
		io.emit('change scene', _scene);
		console.log("received selection: " + _scene);
	});
});
*/
