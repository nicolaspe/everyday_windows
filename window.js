// global threejs/VR variables
let container;
let renderer;
let curr_scene;
let scenes = [];
let camera;
let controls;
let loader;
let lastRenderTime;

let effect;
let vrDisplay;    // variable for the display
let vrButton;     // button to render in VR

window.addEventListener('load', onLoad);

function onLoad(){
  container = document.querySelector('#sketch');
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  // INITIALIZATION
  renderer = new THREE.WebGLRenderer({});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);
  container.appendChild(renderer.domElement);
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);
	scenes[0]  = new THREE.Scene();
	scenes[1]  = new THREE.Scene();
	scenes[2]  = new THREE.Scene();
	scenes[3]  = new THREE.Scene();
	scenes[4]  = new THREE.Scene();
	scenes[5]  = new THREE.Scene();
	curr_scene = scenes[1];

  camera = new THREE.PerspectiveCamera(50, wid/hei, 0.1, 1000);
	controls = new THREE.VRControls( camera );
  controls.standing = true;
  camera.position.y = controls.userHeight;
	controls.update();

  loader = new THREE.TextureLoader();
  createEnvironment();

  // Initialize (Web)VR
  renderer.vr.enabled = true;
  setupVRStage();

  // EVENTS
  window.addEventListener('resize', onWindowResize, true );
  window.addEventListener('vrdisplaypresentchange', onWindowResize, true);
}


// sets up the VR stage + button
function setupVRStage(){
  // get available displays
  navigator.getVRDisplays().then( function(displays){
    if(displays.length > 0) {
      vrDisplay = displays[0];
      // setup button
      vrButton = WEBVR.getButton( vrDisplay, renderer.domElement );
      // document.getElementById('vr_button').appendChild( vrButton );
    } else {
      console.log("NO VR DISPLAYS PRESENT");
    }
    update();
  });
}

function update(){
	window.requestAnimationFrame(animate);
}
function animate(timestamp) {
  let delta = Math.min(timestamp - lastRenderTime, 500);
  lastRenderTime = timestamp;

  if(vrDisplay.isPresenting){
    controls.update();
    effect.render(curr_scene, camera);
    vrDisplay.requestAnimationFrame(animate);
  } else {
		controls.update();
    renderer.render(curr_scene, camera);
    window.requestAnimationFrame(animate);
  }
}


/*
 * === EVENTS ===
 */
function onWindowResize(){
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  effect.setSize(wid, hei);
  renderer.setSize(wid, hei);
	camera.aspect = wid/hei;
  camera.updateProjectionMatrix();
}


/*
 * === ENVIRONMENT CREATION ===
 */
// create graphic objects
function createEnvironment(){
	createScene(0, 0xff0000);
	createScene(1, 0x00ff00);
	createScene(2, 0x0000ff);
}
function createScene(ind, col){
  scenes[ind].background = new THREE.Color( 0xeeeeee );
  let loc = "media/" + ind + "main.gif";

  createLights(ind);
  createFloor(ind);
  createRoom(ind);
  createSphere(ind, col);
}
function createLights(ind){
  let p_light = new THREE.PointLight(0xffffff, 1, 1000, 2);
  p_light.position.set(0, 0, 0);
  scenes[ind].add( p_light );

  let str = 0.5;
  let d_light = new THREE.DirectionalLight(0xffffff, str);
  scenes[ind].add( d_light );
}
function createFloor(ind){
  let size = 40;
  let floorGeo = new THREE.BoxGeometry(size*2, 1, size*2, 10, 2, 10);
  let floorMat = new THREE.MeshPhongMaterial({
    color: 0xd0d0d0,
    specular: 0x000000,
    flatShading: true,
    wireframe: true,
  });
  let planeF = new THREE.Mesh(floorGeo, floorMat);
  planeF.position.set(0, -size/5, 0);
  scenes[ind].add(planeF);
}
function createRoom(ind){
  let size = 40;
  let plGeo = new THREE.PlaneGeometry(size, size, 10, 10);
  // images
  let windowMat = new THREE.MeshBasicMaterial({
    map: loader.load("media/" + ind + "/window.png"),
    side: THREE.DoubleSide,
    transparent: true,
  })
  let personMat = new THREE.MeshBasicMaterial({
    map: loader.load("media/" + ind + "/main.gif"),
    side: THREE.DoubleSide,
    transparent: true,
  })
  for (var i = 0; i < 4; i++) {
    let windowPlane = new THREE.Mesh(plGeo, windowMat);
    let personPlane = new THREE.Mesh(plGeo, personMat);
    let rad = 40;
    let posX = rad * Math.sin(i*Math.PI/2);
    let posZ = rad * Math.cos(i*Math.PI/2);
    personPlane.position.set(posX*1.5, size/4, posZ*1.5);
    personPlane.rotation.y = Math.PI/2 * Math.sin(i*Math.PI/2);
    scenes[ind].add(personPlane);
    windowPlane.position.set(posX, size*.3, posZ);
    windowPlane.rotation.y = Math.PI/2 * Math.sin(i*Math.PI/2);
    scenes[ind].add(windowPlane);
  }
}
function createSphere(ind, col){
  let spGeo = new THREE.SphereGeometry(1, 25, 25);
	let spMat = new THREE.MeshPhongMaterial({
		color: col,
		// emissive: 0xffffff,
		flatShading: true,
	});
  let sphere = new THREE.Mesh(spGeo, spMat);
  sphere.position.set(0, 0, -20);
  scenes[ind].add(sphere);
}
