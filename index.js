var express		 = require('express');
var app 			 = express();
var http 			 = require('http').Server(app);
var io 				 = require('socket.io')(http);
var path			 = require('path');
var bodyParser = require("body-parser");
var port = process.env.PORT || 8081;

var _scene = 0;

app.use(express.static(path.join(__dirname, 'public')));
// configure body-parser as middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req,res) => {
	res.render(__dirname + '/public/index.html');
});

http.listen(port, () => {
	console.log('everyday-windows app listening on port ', port);
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

app.post('/scene', (req, res) => {
	console.log(req.body);
	_scene = request.body.var1;
	io.emit('change scene', _scene);
	console.log("received selection: " + _scene);
	res.sendStatus(200);
});
