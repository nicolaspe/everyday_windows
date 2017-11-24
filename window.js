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
	curr_scene = scenes[0];

  camera = new THREE.PerspectiveCamera(40, wid/hei, 0.1, 1000);
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
	createLight(ind, 0xffffff);
	scenes[ind].background = new THREE.Color( 0xeeeeee );
  createSphere(ind, col);
}
// create lights
function createLight(ind, col){
  let light = new THREE.PointLight( col, 1, 1500, 2 );
  light.position.set(400, 000, 50);
  scenes[ind].add(light);
}
// create skyDome
function createSphere(ind, col){
  // https://www.eso.org/public/usa/images/eso0932a/
  let skyGeo = new THREE.SphereGeometry(50, 25, 25);
	let skyMat = new THREE.MeshPhongMaterial({
		color: col,
		// emissive: 0xffffff,
		flatShading: true,
	});
  let skyDome = new THREE.Mesh(skyGeo, skyMat);
  // skyDome.material.side = THREE.BackSide;
  skyDome.position.set(0, 0, -300);
  scenes[ind].add(skyDome);
}
