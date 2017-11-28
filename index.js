var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 8081;

var _scene = 0;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res) => {
	res.render(__dirname + '/public/index.html');
});

http.listen(port, () => {
	console.log('Example app listening on port ', port);
});

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
