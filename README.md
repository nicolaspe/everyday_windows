# everyday_windows
Final project for Physical Computing &amp;
ICM - ITP Fall 2017.
Ilana Bonder &amp; Nicolás Peña-Escarpentier

[Github repository](https://nicolaspe.github.io/everyday_windows) | [Link](http://138.197.122.214:8090/)

Sexism, harassment, abuse… They all have been historically regarded as personal issues, relegating them from the public discussion, and diverting attention of their status as sociopolitical systemic problems. We want to show what happens behind the doors -or windows, in this case-, what women (mostly cis-het middle class) go through and how society as a whole contributes to the expansion of these issues.

This VR experience about experiences was created in **three.js** and rendered with help of the **WebVR API**. It's mounted on a **node.js** server connected via **WebSockets** to an **Arduino MKR1000**

<iframe src="https://player.vimeo.com/video/246104705" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<p><a href="https://vimeo.com/246104705">Everyday Windows</a> from <a href="https://vimeo.com/user71078874">Ilana Bonder</a> on <a href="https://vimeo.com">Vimeo</a>.</p>


## Sketch

### three.js
In order to have all the windows in one same sketch, we created an individual `scene` for each one, just changing the index of the one to be rendered. As most of the rooms have the same components (floor, cylindrical wall and images of the cutouts and windows), all the scenes are created within a `for` loop with their common elements, and a specific function for the specific assets on each scene. The images are simply textures on top of planes with transparency from the png files.

```
function createEnvironment(){
  for (let i = 0; i < 6; i++) {
    scenes[i].background = new THREE.Color( 0x555555 );
    createLights(i);
    createFloor(i);
    createRoom(i);
  }
  scene0();
  scene1();
  scene2();
  scene3();
  scene4();
  scene5();
}

function createLights(ind){
  let p_light = new THREE.PointLight(col[ind], 1.5, 1000, 2);
  p_light.position.set(0, 10, 0);
  scenes[ind].add( p_light );
}

function createFloor(ind){
  let floorGeo = new THREE.CylinderGeometry(roomSize*4, roomSize*4, 1, 24);
  let floorMat = new THREE.MeshLambertMaterial({
    color: 0x666666,
    emissive: 0x101010,
  });
  let planeF = new THREE.Mesh(floorGeo, floorMat);
  planeF.position.set(0, -roomSize/4, 0);
  scenes[ind].add(planeF);
}

function createRoom(ind){
  // planes w/ images
  let plGeo = new THREE.PlaneGeometry(roomSize, roomSize, 10, 10);

  // images
  let windowMat = new THREE.MeshBasicMaterial({
    map: loader.load("media/" + ind + "/window.png"),
    side: THREE.DoubleSide,
    transparent: true,
  });
  let personMat = new THREE.MeshBasicMaterial({
    map: loader.load("media/" + ind + "/main.gif"),
    side: THREE.DoubleSide,
    transparent: true,
  });
  for (let i = 0; i < 4; i++) {
    let windowPlane = new THREE.Mesh(plGeo, windowMat);
    let personPlane = new THREE.Mesh(plGeo, personMat);
    let rad = 10;
    let posX = rad * Math.sin(i*Math.PI/2);
    let posZ = rad * Math.cos(i*Math.PI/2);
    personPlane.position.set(posX*6, roomSize/4, posZ*6);
    personPlane.rotation.y = Math.PI/2 * Math.sin(i*Math.PI/2);
    scenes[ind].add(personPlane);
    windowPlane.position.set(posX*8, roomSize*.3, posZ*8);
    windowPlane.rotation.y = Math.PI/2 * Math.sin(i*Math.PI/2);
    scenes[ind].add(windowPlane);
  }

  // room walls
  let wallGeo = new THREE.CylinderGeometry(roomSize*5, roomSize*5, 250, 24, 20, true);
  let wallMat = new THREE.MeshLambertMaterial({
    color: 0xd0d0d0,
    side: THREE.DoubleSide,
  });
  let wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 230, 0);
  scenes[ind].add(wall);
}
```


### WebVR
To get the sketch to display on VR was tricky. The implementation of [WebVR](https://webvr.info/) has been evolving and a lot of the information has changed drastically. Also, we'd like to thank [Or Fleisher](http://orfleisher.com/) for helping us get started with WebVR.

We have to start by telling the renderer to enable the VR possibility, load the *VREffect* package to create a separate render for each eye, as well as the *VRControls* package to incorporate the accelerometer rotations for a correct camera control. It is also useful to install the [WebVR API Emulation Chrome Extension](https://chrome.google.com/webstore/detail/webvr-api-emulation/gbdnpaebafagioggnhkacnaaahpiefil) in order to test the sketch with the new controls.
```
renderer.vr.enabled = true;

effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

controls = new THREE.VRControls( camera );
controls.standing = true;
camera.position.y = controls.userHeight;
controls.update();
```

Then, we need to find if there's an available VR display by using the function `navigator.getVRDisplays()`. In this case, we are defaulting to use the first (and most likely, only) VR display. With this display, we can also use the WebVR library tool to automatically create the button to display in VR.
```
// sets up the VR stage + button
function setupVRStage(){
  // get available displays
  navigator.getVRDisplays().then( function(displays){
    if(displays.length > 0) {
      vrDisplay = displays[0];
      // setup button
      vrButton = WEBVR.getButton( vrDisplay, renderer.domElement );
      document.getElementById('vr_button').appendChild( vrButton );
    } else {
      console.log("NO VR DISPLAYS PRESENT");
    }
    update();
  });
}
```

Now, the animation function is a tricky one, because it changes the rendering pipeline. Usually, the browser is the one that requests a new animation frame when it is ready to display a new one, but in this case, the VR display is the one that has to ask for it. Also, as we're using two different renderers (the normal one or the VREffect), we need to discriminate between both states, which can be done with the `vrDisplay.isPresenting` parameter.
```
function animate(timestamp) {
  let delta = Math.min(timestamp - lastRenderTime, 500);
  lastRenderTime = timestamp;

  if(vrDisplay.isPresenting){ // VR rendering
    controls.update();
    effect.render(scenes[current], camera);
    vrDisplay.requestAnimationFrame(animate);
  } else {  // browser rendering
		controls.update();
    renderer.render(scenes[current], camera);
    window.requestAnimationFrame(animate);
  }
}
```

It is also worth noting that we have to add the [WebVR Polyfill](https://github.com/googlevr/webvr-polyfill) package for everything to work outside Google Chrome (remember, this is a browser based implementation!).

### node server
To learn the basics from node, npm and how to mount a server, [Daniel Shiffman's Twitter Bot Tutorial](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6atTSxoRiVnSuOn6JHnq2yV) and [this lynda.com course](https://www.lynda.com/Node-js-tutorials/Learning-Node-js/612195-2.html) are an amazing start.

Thanks to these tutorials, mounting the server was easy, but the web socket implementation was rather difficult. We started with *socket.io*, but that implements extra things that interfered with the Arduino connection. Thankfully, Tom Igoe referred to me to his book [Making Thinks Talk](https://www.makershed.com/products/making-things-talk-third-edition) where he successfully implements this connection using the *[ws](https://www.npmjs.com/package/ws)* library on the server side. So, following one of[his examples](https://github.com/tigoe/MakingThingsTalk2/blob/master/3rd_edition/chapter5/WebSocketServer/server.js) (all of them are on [Github](https://github.com/tigoe/MakingThingsTalk2/tree/master/3rd_edition)), we got it working perfectly.
```
// websocket setup
var WebSocket  = require('ws').Server

wss = new WebSocket({ server: http });

wss.on('connection', function(ws_client){
	console.log("user connected");

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
```

Another thing worth noting, is that to keep the application running on the [DigitalOcean](https://www.digitalocean.com/) server, we used the `[forever](https://www.npmjs.com/package/forever)` package.



## Arduino
For this project, we used an [Arduino MKR1000](https://www.arduino.cc/en/uploads/Main/MKR1000-schematic.pdf), because we needed a way to wirelessly communicate with the phone (via a server, in this case) without resorting to a computer. In the beginning, we tried using a bluetooth module, but as the project was web-based, the security measures in the browsers do not let them access the bluetooth -or other hardware components- easily. Also, it was way harder than we initially thought it would be, and the WiFi communication much easier.

### Internet connection
Getting the Arduino to connect to internet is pretty straightforward. Following [this tutorial](https://create.arduino.cc/projecthub/nazarenko_a_v/mkr1000-connecting-to-the-wifi-3-steps-d02fed) was all we needed.

The connection with the server was harder. After extensive web searches, we asked Tom Igoe who recommended his book *Making Things Talk* where he dedicates a whole chapter to this. So, following the [book example](https://github.com/tigoe/MakingThingsTalk2/blob/master/3rd_edition/chapter5/WebSocketClient/WebSocketClient.ino) and the
[ArduinoHttpClient library example](https://github.com/arduino-libraries/ArduinoHttpClient/blob/master/examples/SimpleWebSocket/SimpleWebSocket.ino) we got to set everything up.

```
#include <SPI.h>
#include <WiFi101.h>
#include <ArduinoHttpClient.h>

WiFiClient wifiClient;
WebSocketClient webSocket = WebSocketClient(wifiClient, server, port);

void connectToServer() {
  Serial.println("attempting to connect to server");
  webSocket.begin();

  Serial.println(webSocket.connected());
  if (!webSocket.connected()) {
    Serial.println("failed to connect to server");
  } else {
    Serial.println("connected to server");
  }
}

void sendWindow(int num){
  // check wifi connection
  if(WiFi.status() != WL_CONNECTED){
    connectWiFi();
  }
  // check server connection
  while(!webSocket.connected()){
    connectToServer();
  }
  // send the message!
  webSocket.beginMessage(TYPE_TEXT);  // message type: text
  webSocket.print(num);               // send the value
  webSocket.endMessage();             // close message
  Serial.print("window ");
  Serial.print(num);
  Serial.println(" sent");
}
```

### Interface components
In the beginning, we tried using a capacitive touch sensor ([MPR121](https://www.adafruit.com/product/1982)) and covered the borders of the windows with capacitive fabric for it to work. The code was easily done by following the [Adafruit MPR121 tutorial](https://learn.adafruit.com/adafruit-mpr121-12-key-capacitive-touch-sensor-breakout-tutorial/wiring) plus [a quick code fix](https://forums.adafruit.com/viewtopic.php?f=19&t=68139&sid=7e3379c9e062e124e354644c05cbc33e). Sadly, the user-testing led us to realize that this was not the best choice. People would often try to touch the window itself, rather that the border, due to poor instructions. So, we opted for the not-as-fun more-conventional approach and got LED momentary pushbuttons.

In order to light up the rooms with colors that match the lights on the sketch, we planned to use RGB LEDs, but they posed a bunch of difficulties. They need a lot of pins (3 for each LED * 6 windows= 18 pins!!!), or a lot of mathematics if we were to hard code them (to use only one pin per window). Still, using NeoPixels was a much better idea, and amazingly simple to code! With the [Adafruit NeoPixel library](https://github.com/adafruit/Adafruit_NeoPixel) it's as easy as giving it the pin number, how many pixels there are, and the RGB values for each. Et voilá! That way, everything stays in the code, in case we want to change anything.

```
void windowLight(int num){
  // window variables
  int r = window_colors[num][0];
  int g = window_colors[num][1];
  int b = window_colors[num][2];
  // window pixels
  for(int i=0; i<3; i++){
    int index = window_pixels[num][i];
    pixels.setPixelColor(index, pixels.Color(r, g, b));
    pixels.show();
  }
}
```


## Fabrication



## Resources
Here is a list of -previously unreferenced- web resources from where we took some code or help to implement everything:

**On WebVR**
- [Google VR Services](https://play.google.com/store/apps/details?id=com.google.vr.vrcore)
- [Getting started with WebVR](https://developers.google.com/web/fundamentals/vr/getting-started-with-webvr/)
- [Request token for API use](https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md)
- [WebVR boilerplate package](https://github.com/borismus/webvr-boilerplate) - useful package, but we didn't use it in the end
- [Mozilla WebVR implementation guide](https://developer.mozilla.org/en-US/docs/Web/API/WebVR_API/Using_the_WebVR_API)
